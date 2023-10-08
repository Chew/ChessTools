<template>
  <Pie id="overallRankGraph"
       :data="{
         labels: ['Remaining', 'Ranked'],
         datasets: [{
           data: [ memberInfo.total, (memberInfo.total) - (memberInfo.rank) ],

           backgroundColor: [
             '#FF6384',
             '#4ee081'
           ]
         }],
       }" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Pie } from 'vue-chartjs'

import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement } from 'chart.js'
import { USCFMemberRanking } from '~/types/uscf'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement)

export default defineComponent({
  name: 'RankPieChart',
  components: { Pie },

  props: {
    memberInfo: {
      type: Object as () => USCFMemberRanking,
      required: true
    }
  }
})
</script>

<style scoped>

</style>
