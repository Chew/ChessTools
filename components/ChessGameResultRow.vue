<template>
  <tr>
    <td>
      <span class="d-flex align-center">
        <span :class="['play-icon', unknownColor ? 'unknown' : 'white', cleanResult[0] == 1 ? 'winner' : '']" />
        <span v-if="whitePlayer.id == null">{{ whitePlayer.name }}</span>
        <NuxtLink v-else :to="`/profile/${whitePlayer.id}`">{{ whitePlayer.name }}</NuxtLink>
        <span v-if="whitePlayer.elo" class="text-grey">&nbsp;({{ whitePlayer.elo }})</span>
      </span>
      <span class="d-flex align-center">
        <span :class="['play-icon', unknownColor ? 'unknown' : 'black', cleanResult[1] == 1 ? 'winner' : '']" />
        <span v-if="blackPlayer.id == null">{{ blackPlayer.name }}</span>
        <NuxtLink v-else :to="`/profile/${blackPlayer.id}`">{{ blackPlayer.name }}</NuxtLink>
        <span v-if="blackPlayer.elo" class="text-grey">&nbsp;({{ blackPlayer.elo }})</span>
      </span>
    </td>

    <td>
      <div class="d-flex align-center">
        <div style="width: 0.9rem">
          {{ cleanResult[0] }}<br>
          {{ cleanResult[1] }}
        </div>
        <div class="ml-2">
          <v-tooltip :text="friendlyResult">
            <template #activator="{ props }">
              <i v-if="friendlyResult.includes('Win')" v-bind="props"
                 class="fa-solid fa-square-plus text-green-lighten-1" />
              <i v-else-if="friendlyResult.includes('Loss')" v-bind="props"
                 class="fa-solid fa-square-minus text-red-lighten-1" />
              <i v-else v-bind="props" class="fa-solid fa-square text-gray-lighten-1" />
            </template>
          </v-tooltip>
        </div>
      </div>
    </td>

    <td v-if="link !== '' && link !== null && link !== undefined && linkNote == ''">
      <NuxtLink :to="link">
        <v-btn color="blue">
          View&nbsp;<i class="fa-solid fa-external-link" />
        </v-btn>
      </NuxtLink>
    </td>
    <td v-else-if="link !== '' && link !== null && link !== undefined">
      <v-tooltip :text="linkNote" location="top">
        <template #activator="{ props }">
          <NuxtLink v-bind="props" :to="link">
            <v-btn color="gray">
              View&nbsp;<i class="fa-solid fa-external-link" />
            </v-btn>
          </NuxtLink>
        </template>
      </v-tooltip>
    </td>
    <td v-else-if="link == null">
      <span class="text-grey">No Link</span>
    </td>
  </tr>
</template>
<script lang="ts">
import type { PropType } from 'vue'

export default {
  name: 'ChessGameResultRow',
  props: {
    whitePlayer: {
      type: Object as PropType<{id: string | null, name: string, elo?: string|number}>,
      required: true
    },
    blackPlayer: {
      type: Object as PropType<{id: string | null, name: string, elo?: string|number}>,
      required: true
    },
    unknownColor: {
      type: Boolean,
      default: false
    },
    cleanResult: {
      type: Array as PropType<(number|string)[]>,
      required: true
    },
    friendlyResult: {
      type: String,
      required: true
    },
    link: {
      type: null as unknown as PropType<string | null | undefined>,
      default: ''
    },
    linkNote: {
      type: String,
      default: ''
    }
  }
}
</script>
<!--suppress CssUnusedSymbol -->
<style scoped>
.winner {
  border: 0.2rem solid #81b64c;
}

.white {
  background-color: #fff;
}

.black {
  background-color: #565352;
}

.unknown {
  background-color: #ABA9A9;
}

.play-icon {
  border-radius: 0.2rem;
  display: block;
  flex-shrink: 0;
  height: 1rem;
  margin-right: 0.5rem;
  width: 1rem;
}

.align-center {
  align-items: center;
}
</style>
