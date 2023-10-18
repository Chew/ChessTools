<template>
  <tr>
    <td v-if="playerColor == 'black'">
      <span class="d-flex align-center">
        <span :class="['play-icon', 'white', friendlyResult.includes('Loss') ? 'winner' : '']" />
        {{ opponent }}
      </span>
      <span class="d-flex align-center">
        <span :class="['play-icon', 'black', friendlyResult.includes('Win') ? 'winner' : '']" />
        {{ player }}
      </span>
    </td>
    <td v-else>
      <span class="d-flex align-center">
        <span :class="['play-icon', 'white', friendlyResult.includes('Win') ? 'winner' : '']" />
        {{ player }}
      </span>
      <span class="d-flex align-center">
        <span :class="['play-icon', 'black', friendlyResult.includes('Loss') ? 'winner' : '']" />
        {{ opponent }}
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
  </tr>
</template>
<script lang="ts">
import { Color } from 'chessground/types'
import type { PropType } from 'vue'

export default {
  name: 'ChessGameResultRow',
  props: {
    playerColor: {
      type: String as PropType<Color>,
      required: true
    },
    player: {
      type: String,
      required: true
    },
    opponent: {
      type: String,
      required: true
    },
    cleanResult: {
      type: Array as PropType<(number|string)[]>,
      required: true
    },
    friendlyResult: {
      type: String,
      required: true
    }
  }
}
</script>
<style scoped>
/*noinspection CssUnusedSymbol*/
.winner {
  border: 0.2rem solid #81b64c;
}

.white {
  background-color: #fff;
}

.black {
  background-color: #565352;
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
