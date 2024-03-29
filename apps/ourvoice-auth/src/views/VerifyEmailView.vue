<template>
  <div></div>
</template>

<script lang="ts">
import { verifyEmail } from 'supertokens-web-js/recipe/emailverification'
import Session from 'supertokens-web-js/recipe/session'
import { defineComponent } from 'vue'
import { ManageRedirectStateService } from '../utils/manage-redirect-state.service'

import config from '@/config'

const redirect: ManageRedirectStateService = new ManageRedirectStateService()
const adminURL = config.adminURL

export default defineComponent({
  data() {
    return {}
  },
  mounted() {
    this.checkForSession()
  },
  methods: {
    checkForSession: async function () {
      if (!(await Session.doesSessionExist())) {
        // since a session does not exist, we send the user to the login page.
        return window.location.assign('/signinWithEmailPassword')
      }
      this.consumeVerificationCode()
    },
    consumeVerificationCode: async function () {
      try {
        let response = await verifyEmail()
        if (response.status === 'EMAIL_VERIFICATION_INVALID_TOKEN_ERROR') {
          // This can happen if the verification code is expired or invalid.
          // You should ask the user to retry
          window.alert('Oops! Seems like the verification link expired. Please try again')
          window.location.assign('/auth/verify-email') // back to the email sending screen.
        } else {
          // email was verified successfully.
          // attempt refreshing token to get deployment data into payload
          Session.attemptRefreshingSession().then((success) => {
            if (success) {
              this.handleRedirect()
            } else {
              // we redirect to the login page since the user
              // is now logged out
              return window.location.assign('/signinWithEmailPassword')
            }
          })
        }
      } catch (err: any) {
        if (err.isSuperTokensGeneralError === true) {
          // this may be a custom error message sent from the API by you.
          window.alert(err.message)
        } else {
          window.alert('Oops! Something went wrong.')
        }
      }
    },
    handleRedirect: function () {
      if (redirect.exists()) {
        const redirectTo = redirect.get()
        redirect.purge()
        window.location.href = redirectTo
      } else {
        // fallback redirect
        window.location.href = adminURL
      }
    }
  }
})
</script>
