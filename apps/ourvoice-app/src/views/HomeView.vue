<template>
  <div class="grid grid-cols-full md:grid-cols-2 h-full">
    <!-- Content -->
    <div class="flex flex-col py-20 items-center md:items-start mx-4 md:px-16 md:translate-y-0">
      <div>
        <div class="grid grid-cols-2 divide-x-4 divide-black gap-2 place-items-center mb-16 -ml-8">
          <div>
            <a href="#" class="">
              <span class="sr-only">OurVoice</span>
              <img
                class="h-11"
                src="@/assets/logo/ourvoice_logo_primary_dark.svg"
                alt="OurVoice Logo"
              />
            </a>
          </div>
          <div>
            <a href="#" class="">
              <span class="sr-only">DCA</span>
              <img
                class="h-11 ml-6 rounded-md"
                :src="getConfig('deploymentLogo')"
                alt="Deployment Logo"
              />
            </a>
          </div>
        </div>
      </div>
      <!-- Deployment slogan -->
      <p
        class="text-center md:text-left mb-6 text-4xl lg:text-5xl text-ourvoice-black leading-20 font-bold"
      >
        {{ getConfig('slogan') }}
      </p>
      <!-- Deployment description -->
      <Description class="description-text max-w-[600px] text-lg text-left mb-6 mx-auto" />
      <div class="flex flex-wrap gap-2 justify-center mx-auto md:mx-0">
        <CustomButton
          v-if="!session"
          label="Get Started"
          class-name="w-52 h-14 px-2 py-4 rounded-full text-ourvoice-base"
          variant="filled"
          @click="redirectToAuthPage"
        />
        <CustomButton
          v-else
          :to="'/posts'"
          label="Get Started"
          class-name="w-52 h-14 px-2 py-4 rounded-full text-ourvoice-base"
          variant="filled"
        />
        <CustomButton
          to="/about"
          label="FAQ"
          class-name="w-52 h-14 px-2 py-4 rounded-full border-2  border-ourvoice-secondary"
          variant="outlined"
        />
      </div>
      <!-- Deployment info -->
      <!-- <Information class="text-ourvoice-grey text-lg text-center lg:text-left mb-6" /> -->
    </div>
    <div class="hidden md:inline-flex">
      <img
        class="w-full object-cover h-full"
        :src="getConfig('heroImage')"
        alt="OurVoice interface"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Session from 'supertokens-web-js/recipe/session'
import { EmailVerificationClaim } from 'supertokens-web-js/recipe/emailverification'

import YamlContent from '../../../../config/config.yml'
import Description from '../../../../config/content/description.md'
// import Information from '../../../../config/content/information.md'

import { useDeploymentStore } from '../stores/deployment'
import config from '../config'
import { mapStores } from 'pinia'
import { useUserStore } from '../stores/user'
import CustomButton from '@/components/common/CustomButton.vue'

const apiURL = config.apiURL
const authBaseURL = config.authURL + '/signinWithoutPassword'

export default defineComponent({
  components: {
    CustomButton,
    Description
    // Information
    // Consent
  },
  props: ['deployment'],
  data() {
    return {
      // if session is false, we show a blank screen
      // else we render the UI
      session: false,
      userId: '',
      authURL: `${authBaseURL}?d=${this.deployment}`,
      deploymentStore: useDeploymentStore()
    }
  },
  computed: {
    ...mapStores(useUserStore)
  },
  methods: {
    // TODO: this list might be coming from the database later
    getConfig(option: string) {
      return YamlContent[option]
    },
    checkForSession: async function () {
      if (!(await Session.doesSessionExist())) return
      let validationErrors = await Session.validateClaims()

      if (validationErrors.length === 0) {
        // user has verified their email address
        const userId = await Session.getUserId()
        // this will render the UI
        this.session = true
        this.userId = userId
      } else {
        for (const err of validationErrors) {
          if (err.validatorId === EmailVerificationClaim.id) {
            // email is not verified
            window.location.href = this.authURL
          }
        }
      }
    },
    callAPI: async function () {
      const response = await fetch(`${apiURL}/sessioninfo`)

      if (response.status === 401) {
        // this means that the session has expired and the
        // user needs to relogin.
        window.location.href = this.authURL
        return
      }

      const json = await response.json()

      window.alert('Session Information:\n' + JSON.stringify(json, null, 2))
    },
    redirectToAuthPage: function () {
      window.location.href = this.authURL
    }
  },

  async mounted() {
    await this.checkForSession()
  }
})
</script>

<style scoped>
.description-text {
  align-self: stretch;
  color: var(--body-text, #3d3d3d);
  /* Desktop/Caption_Regular */
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 140%; /* 16.8px */
}
</style>
