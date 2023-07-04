import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { PollWithResult, VoteInput } from '../../graphql';
import { PollCreateDto } from './dto/poll-create.dto';
import { PollUpdateDto } from './dto/poll-update.dto';
import { PollModerationRepository } from './poll-moderation.repository';
import { PollRepository } from './poll.repository';

@Injectable()
export class PollService {
  constructor(
    private readonly pollRepository: PollRepository,
    private readonly pollModerationRepository: PollModerationRepository,
  ) {}

  async getAvailablePolls(userHash: string) {
    const allActivePolls = await this.pollRepository.getPolls({
      expiresAfter: new Date(),
      active: true,
    });

    const pollsUserVotedFor =
      await this.pollModerationRepository.getPollsVoterVoted(userHash);
    const pollsUserVotedForIds = new Set(
      pollsUserVotedFor.map((pollUserVotedFor) => pollUserVotedFor.pollId),
    );
    return allActivePolls.filter((poll) => !pollsUserVotedForIds.has(poll.id));
  }

  async getPollsWithResult(moderatorHash: string): Promise<PollWithResult[]> {
    const polls = await this.pollRepository.getPolls({});
    const pollsWithResult = polls.map(async (poll) => {
      const pollVotes = await this.pollModerationRepository.getPollVotes(
        poll.id,
      );
      const optionIdToNumVotes = new Map();
      for (const vote of pollVotes) {
        optionIdToNumVotes.set(vote.optionId, vote.numVotes);
      }
      return {
        ...poll,
        options: poll.options.map((option) => ({
          ...option,
          numVotes: optionIdToNumVotes.has(option.id)
            ? optionIdToNumVotes.get(option.id)
            : 0,
        })),
      };
    });
    return await Promise.all(pollsWithResult);
  }

  async createPoll(data: PollCreateDto) {
    const pollCreateDto = plainToClass(PollCreateDto, data);
    const errors = await validate(pollCreateDto);
    if (errors.length > 0) {
      console.log(errors);
      throw new BadRequestException(errors);
    }

    return await this.pollRepository.createPoll(pollCreateDto);
  }

  async updatePoll(pollId: number, data: PollUpdateDto) {
    const pollDto = plainToClass(PollUpdateDto, data);
    const errors = await validate(pollDto);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    const poll = await this.pollRepository.getPoll(pollId);
    if (!poll) {
      throw new NotFoundException('Poll does not exist');
    }

    const questionChanged =
      data.question !== undefined || data.options !== undefined;
    if (questionChanged) {
      const pollVotes = await this.pollModerationRepository.getPollVotes(
        pollId,
      );
      if (pollVotes.length != 0) {
        throw new BadRequestException(
          'Unable to change question or options if there are votes',
        );
      }
    }

    const newPoll = await this.pollRepository.updatePoll(pollId, pollDto);

    // this prevents some (but not all race conditions)
    this.pollModerationRepository.removeAllVotesOfPoll(pollId);

    return newPoll;
  }

  async removePoll(pollId: number) {
    const poll = await this.pollRepository.getPoll(pollId);
    if (poll === null) {
      throw new NotFoundException('Non existent poll');
    }
    const pollVotes = await this.pollModerationRepository.getPollVotes(pollId);
    if (pollVotes.length != 0) {
      throw new BadRequestException('Unable to remove poll if there are votes');
    }
    await this.pollRepository.removePollById(pollId);
  }

  async vote(voteInput: VoteInput) {
    const { pollId, voterHash, optionId } = voteInput;
    const poll = await this.pollRepository.getPoll(pollId);
    if (poll === null) {
      throw new NotFoundException('Non existent poll');
    }
    if (!poll.active) {
      throw new BadRequestException('Poll is not active');
    }
    if (poll.expiresAt !== null && new Date() >= poll.expiresAt) {
      throw new BadRequestException('Poll has expired');
    }
    const pollOption = await this.pollRepository.getPollOption(optionId);
    if (pollOption === null) {
      throw new NotFoundException('non existent optionId');
    }
    if (pollId != pollOption.pollId) {
      throw new BadRequestException('pollId does not match with option Id');
    }

    await this.pollModerationRepository.vote(voterHash, pollId, optionId);
    const pollVotes = await this.pollModerationRepository.getPollVotes(pollId);
    const numTotalVotes = pollVotes.reduce(
      (acc, pollVote) => acc + pollVote.numVotes,
      0,
    );
    let stats: { optionId: number; proportion: number }[] | null = null;
    if (numTotalVotes >= 5) {
      stats = pollVotes.map((pollVote) => ({
        optionId: pollVote.optionId,
        proportion: pollVote.numVotes / numTotalVotes,
      }));
    }
    return {
      pollId,
      optionId,
      stats: stats,
    };
  }
}
