<template>
  <v-dialog width="500">
    <template #activator="{ props }">
      <v-btn v-bind="props" color="red">
        <i class="fas fa-link-slash" />&nbsp;Unlink
      </v-btn>
    </template>

    <template #default="{ isActive }">
      <v-card title="Confirmation">
        <v-card-text>
          Are you sure you want to remove this integration?
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn text="Confirm" color="red" :loading="sending" @click="unlink(integration, isActive)" />
          <v-btn text="Cancel" @click="isActive.value = false" />
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { Ref, PropType } from 'vue'
import type { Integrations } from '~/types/integrations'

export default defineComponent({
  name: 'UnlinkIntegrationButton',

  props: {
    integration: {
      type: String as PropType<Integrations>,
      required: true
    }
  },

  emits: ['success', 'failure'],

  data() {
    return {
      sending: false
    }
  },

  methods: {
    unlink(platform: string, isActive: Ref<boolean>) {
      this.sending = true

      $fetch<{success: boolean, error: string}>('/api/users/me/integrations/unlink', {
        headers: useRequestHeaders(['cookie']),
        method: 'POST',
        body: {
          platform
        }
      }).then((data) => {
        this.sending = false
        if (!data) {
          // emit failure
          this.$emit('failure', 'Unknown error')
          return
        }

        if (!data.success) {
          // @ts-ignore error is just guaranteed to be a string here
          this.$emit('failure', data.error)
          return
        }

        // emit success
        this.$emit('success')
        isActive.value = false
      }).catch((err) => {
        this.sending = false
        this.$emit('failure', err)
      })
    }
  }
})
</script>

<style scoped>

</style>
