<template>
  <div class="q-pa-sm">
    <q-card class="q-my-md">
      <q-card-section class="row justify-between items-center">
        <div class="col-xs-12 col-md-3 text-h4 text-bold">
          DashBoard
        </div>
        <div class="col-xs-12 col-md-9 justify-end flex q-gutter-sm">
          <q-datetime-picker
            style="width: 200px"
            dense
            hide-bottom-space
            outlined
            stack-label
            bottom-slots
            label="Data/Hora Agendamento"
            mode="date"
            color="primary"
            format24h
            v-model="params.startDate"
          />
          <q-datetime-picker
            style="width: 200px"
            dense
            hide-bottom-space
            outlined
            stack-label
            bottom-slots
            label="Data/Hora Agendamento"
            mode="date"
            color="primary"
            format24h
            v-model="params.endDate"
          />
          <!-- <q-select
            style="width: 300px"
            dense
            outlined
            hide-bottom-space
            emit-value
            map-options
            multiple
            options-dense
            use-chips
            label="Filas"
            color="primary"
            v-model="params.queuesIds"
            :options="filas"
            :input-debounce="700"
            option-value="id"
            option-label="queue"
            input-style="width: 280px; max-width: 280px;"
          /> -->
          <q-btn
            class="bg-padrao"
            flat
            color="primary"
            icon="refresh"
            label="Atualizar"
            @click="getDashData"
          />

        </div>
      </q-card-section>
    </q-card>
    <q-card class="q-my-md q-pa-sm" >
      <q-card-section class="q-pa-md">
        <div class="row q-gutter-md justify-between" style="justify-content: center; gap: 10px;">
          <div>
            <q-card class="my-card full-height" flat bordered style="min-width: 300px; border-radius: 20px;">
              <q-card-section horizontal style="display: flex; flex-direction: row;">
                <q-card-section >
                  <q-icon name="all_inbox" color="blue" bordered size="50px" style="height: 100%;"></q-icon>
                </q-card-section>
                <q-card-section class="text-center " style="display: flex; width: 100%; flex-direction: column; padding-top: 30px;">
                  Total Atendimentos
                  <p class="text-h7 text-bold text-center" style="font-size: 30px;">{{ticketsAndTimes.qtd_total_atendimentos || 0}}</p>
                </q-card-section>
              </q-card-section>
            </q-card>
          </div>
          <div>
            <q-card class="my-card full-height" flat bordered style="min-width: 300px; border-radius: 20px; ">
              <q-card-section horizontal style="display: flex; flex-direction: row;">
                <q-card-section >
                  <q-icon name="call_made" color="blue" bordered size="50px" style="height: 100%;"></q-icon>
                </q-card-section>
                <q-card-section class="text-center " style="display: flex; width: 100%; flex-direction: column; padding-top: 30px;">
                  Ativo
                  <p class="text-h7 text-bold text-center" style="font-size: 30px;">{{ ticketsAndTimes.qtd_demanda_ativa || 0 }}</p>
                </q-card-section>
              </q-card-section>
            </q-card>
          </div>
          <div>
            <q-card class="my-card full-height" flat bordered style="min-width: 300px; border-radius: 20px;">
              <q-card-section horizontal style="display: flex; flex-direction: row;">
                <q-card-section >
                  <q-icon name="call_received" color="blue" bordered size="50px" style="height: 100%;"></q-icon>
                </q-card-section>
                <q-card-section class="text-center " style="display: flex; width: 100%; flex-direction: column; padding-top: 30px;">
                  Receptivo
                  <p class="text-h7 text-bold text-center" style="font-size: 30px;">{{ ticketsAndTimes.qtd_demanda_receptiva || 0}}</p>
                </q-card-section>
              </q-card-section>
            </q-card>
          </div>
          <div>
            <q-card class="my-card full-height" flat bordered style="min-width: 300px; border-radius: 20px;">
              <q-card-section horizontal style="display: flex; flex-direction: row;">
                <q-card-section >
                  <q-icon name="person_add" color="blue" bordered size="50px" style="height: 100%;"></q-icon>
                </q-card-section>
                <q-card-section class="text-center " style="display: flex; width: 100%; flex-direction: column; padding-top: 30px;">
                  Novos Contatos
                  <p class="text-h7 text-bold text-center" style="font-size: 30px;">{{ ticketsAndTimes.new_contacts || 0}}</p>
                </q-card-section>
              </q-card-section>
            </q-card>
          </div>
          <div>
            <q-card class="my-card full-height" flat bordered style="min-width: 300px; border-radius: 20px;">
              <q-card-section horizontal style="display: flex; flex-direction: row;">
                <q-card-section>
                    <q-icon name="schedule" color="blue" bordered size="50px" style="height: 100%;"></q-icon>
                </q-card-section>
                <q-card-section class="text-center " style="display: flex; width: 100%; flex-direction: column; padding-top: 30px;">
                  <q-tooltip>
                      Tempo Medio de Atendimento
                  </q-tooltip>
                  <div>TMA</div>
                  <p class="text-h7 text-bold text-center" style="font-size: 30px;">{{ cTmaFormat || 0 }}</p>
                </q-card-section>
              </q-card-section>
            </q-card>
          </div>
          <div>
            <q-card class="my-card full-height" flat bordered style="min-width: 300px; border-radius: 20px; ">
              <q-card-section horizontal style="display: flex; flex-direction: row;">
                <q-card-section >
                  <q-icon name="schedule_send" color="blue" bordered size="50px" style="height: 100%;"></q-icon>
                </q-card-section>
                <q-card-section class="text-center " style="display: flex; width: 100%; flex-direction: column; padding-top: 30px;">
                  <div>Tempo Médio 1º Resposta</div>
                  <p class="text-h7 text-bold text-center" style="font-size: 30px;">{{ cTmeFormat || 0 }}</p>
                </q-card-section>
              </q-card-section>
            </q-card>
          </div>
        </div>

      </q-card-section>
    </q-card>

    <div class="row q-col-gutter-md">
      <div class="col-xs-12 col-sm-6">
        <q-card>
          <q-card-section class="q-pa-md">
            <ApexChart
              ref="ChartTicketsUsers"
              type="donut"
              height="300"
              :options="ticketsChannelsOptions"
              :series="ticketsChannelsOptions.series"
            />
          </q-card-section>
        </q-card>
      </div>
      <div class="col-xs-12 col-sm-6">
        <q-card>
          <q-card-section class="q-pa-md">
            <ApexChart
              ref="ChartTicketsQueue"
              type="donut"
              height="300"
              width="100%"
              :options="ticketsQueueOptions"
              :series="ticketsQueueOptions.series"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>
    <q-card class="q-my-md">
      <q-card-section class="q-pa-md">
        <ApexChart
          ref="ChartTicketsEvolutionByPeriod"
          type="line"
          height="300"
          :options="ticketsEvolutionByPeriodOptions"
          :series="ticketsEvolutionByPeriodOptions.series"
        />
      </q-card-section>
    </q-card>

    <q-card class="q-my-md q-pa-sm">
      <q-card-section class="q-pa-md">
        <q-table
          title="Performance Usuários"
          :data="ticketsPerUsersDetail"
          :columns="TicketsPerUsersDetailColumn"
          row-key="email"
          :pagination.sync="paginationTableUser"
          :rows-per-page-options="[0]"
          bordered
          flat
          hide-bottom
        >
          <template v-slot:body-cell-name="props">
            <q-td :props="props">
              <div class="row col text-bold"> {{ props.row.name || 'Não informado' }} </div>
              <div class="row col text-caption">{{ props.row.email }} </div>
            </q-td>
          </template>
        </q-table>

      </q-card-section>

    </q-card>

  </div>
</template>

<script>
import { groupBy } from 'lodash'
import { ListarFilas } from 'src/service/filas'
import {
  GetDashTicketsAndTimes,
  GetDashTicketsEvolutionChannels,
  GetDashTicketsQueue,
  GetDashTicketsEvolutionByPeriod,
  GetDashTicketsPerUsersDetail
} from 'src/service/estatisticas'
import { subDays, format, differenceInDays } from 'date-fns'
import ApexChart from 'vue-apexcharts'
export default {
  name: 'IndexDashboard',
  components: { ApexChart },
  data () {
    return {
      confiWidth: {
        horizontal: false,
        width: this.$q.screen.width
      },
      params: {
        startDate: format(subDays(new Date(), 6), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
        queuesIds: []
      },
      paginationTableUser: {
        rowsPerPage: 40,
        rowsNumber: 0,
        lastIndex: 0
      },
      filas: [],
      ticketsUsers: [],
      ticketsUsersOptions: {
        // colors: ['#008FFB', '#00E396', '#FEB019'],
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 1000
        },
        fill: {
          type: 'gradient',
          gradient: {
            shade: 'dark',
            type: 'vertical',
            shadeIntensity: 0.05,
            inverseColors: false,
            opacityFrom: 1,
            opacityTo: 0.9,
            stops: [0, 100]
          }
        },
        chart: {
          toolbar: {
            show: true
          }
        },
        legend: {
          position: 'bottom'
        },
        title: {
          text: 'Atendimento por usuario'
        },
        noData: {
          text: 'Sem dados aqui!',
          align: 'center',
          verticalAlign: 'middle',
          offsetX: 0,
          offsetY: 0,
          style: {
            color: undefined,
            fontSize: '14px',
            fontFamily: undefined
          }
        },
        series: [],
        labels: [],
        theme: {
          mode: 'light',
          palette: 'palette1'
        },
        plotOptions: {
          pie: {
            dataLabels: {
              offset: -10
            }
          }
        },
        dataLabels: {
          enabled: true,
          textAnchor: 'middle',
          style: {
            fontSize: '16px',
            offsetY: '150',
            fontFamily: 'Helvetica, Arial, sans-serif'
          },
          offsetX: 0
        }
      },
      ticketsQueue: [],
      ticketsQueueOptions: {
        // colors: ['#008FFB', '#00E396', '#FEB019'],
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 1000
        },
        fill: {
          type: 'gradient',
          gradient: {
            shade: 'dark',
            type: 'vertical',
            shadeIntensity: 0.05,
            inverseColors: false,
            opacityFrom: 1,
            opacityTo: 0.9,
            stops: [0, 100]
          }
        },
        chart: {
          toolbar: {
            show: true
          }
        },
        // responsive: [{
        //   breakpoint: 480,
        //   options: {
        //     chart: {
        //       width: 250
        //     },
        //     legend: {
        //       position: 'bottom'
        //     }
        //   }
        // }],
        legend: {
          position: 'bottom'
        },
        title: {
          text: 'Atendimento por fila'
        },
        noData: {
          text: 'Sem dados aqui!',
          align: 'center',
          verticalAlign: 'middle',
          offsetX: 0,
          offsetY: 0,
          style: {
            color: undefined,
            fontSize: '14px',
            fontFamily: undefined
          }
        },
        series: [],
        labels: [],
        theme: {
          mode: 'light',
          palette: 'palette1'
        },
        plotOptions: {
          pie: {
            dataLabels: {
              offset: -10
            }
          }
        },
        dataLabels: {
          enabled: true,
          textAnchor: 'middle',
          style: {
            fontSize: '16px',
            offsetY: '150',
            fontFamily: 'Helvetica, Arial, sans-serif'
          },
          offsetX: 0
        }
      },
      ticketsEvolutionChannels: [],
      ticketsEvolutionChannelsOptions: {
        // colors: ['#008FFB', '#00E396', '#FEB019'],
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 1000
        },
        theme: {
          mode: 'light',
          palette: 'palette1'
        },
        chart: {
          toolbar: {
            tools: {
              download: true,
              selection: false,
              zoom: false,
              zoomin: false,
              zoomout: false,
              pan: false,
              reset: false | '<img src="/static/icons/reset.png" width="20">'
            }

          }
        },
        grid: {
          show: true,
          strokeDashArray: 0,
          xaxis: {
            lines: {
              show: true
            }
          }
        },
        stroke: {
          width: [4, 4, 4]
        },
        fill: {
          type: 'gradient',
          gradient: {
            shade: 'dark',
            type: 'vertical',
            shadeIntensity: 0.05,
            inverseColors: false,
            opacityFrom: 1,
            opacityTo: 0.9,
            stops: [0, 100]
          }
        },
        title: {
          text: 'Evolução por canal',
          align: 'left'
        },
        dataLabels: {
          enabled: true,
          enabledOnSeries: [1]
        },
        xaxis: {
          categories: []
        },
        yaxis: {
          title: {
            text: 'Atendimentos'
          }
        },
        tooltip: {
          shared: false,
          x: {
            show: false
          },
          y: {
            formatter: function (val) {
              return Number(val).toFixed(0)
            }
          }
        },
        legend: {
          show: false
        }
      },
      ticketsEvolutionByPeriod: [],
      ticketsEvolutionByPeriodOptions: {
        // colors: ['#008FFB', '#00E396', '#FEB019'],
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 1000
        },
        theme: {
          mode: 'light',
          palette: 'palette1'
        },
        chart: {
          toolbar: {
            tools: {
              download: true,
              selection: false,
              zoom: false,
              zoomin: false,
              zoomout: false,
              pan: false,
              reset: false | '<img src="/static/icons/reset.png" width="20">'
            }

          }
        },
        grid: {
          show: true,
          strokeDashArray: 0,
          xaxis: {
            lines: {
              show: true
            }
          }
        },
        stroke: {
          width: [4, 4, 4]
        },
        fill: {
          type: 'gradient',
          gradient: {
            shade: 'dark',
            type: 'vertical',
            shadeIntensity: 0.05,
            inverseColors: false,
            opacityFrom: 1,
            opacityTo: 0.9,
            stops: [0, 100]
          }
        },
        title: {
          text: 'Evolução atendimentos',
          align: 'left'
        },
        dataLabels: {
          enabled: true,
          enabledOnSeries: [1]
        },
        xaxis: {
          categories: []
        },
        yaxis: {
          title: {
            text: 'Atendimentos'
          }
        },
        tooltip: {
          shared: false,
          x: {
            show: false
          },
          y: {
            formatter: function (val) {
              return Number(val).toFixed(0)
            }
          }
        },
        legend: {
          show: false
        }
      },
      ticketsAndTimes: {
        qtd_total_atendimentos: null,
        qtd_demanda_ativa: null,
        qtd_demanda_receptiva: null,
        TMA: null,
        TME: null
      },
      ticketsPerUsersDetail: [],
      TicketsPerUsersDetailColumn: [
        {
          name: 'name',
          label: 'Usuário',
          field: 'name',
          align: 'left',
          style: 'width: 300px;',
          format: (v, r) => {
            return v ? `${r.name} | ${r.email}` : 'Não informado'
          }
        },
        {
          name: 'qtd_pendentes',
          label: 'Pendentes',
          field: 'qtd_pendentes'
        },
        {
          name: 'qtd_em_atendimento',
          label: 'Atendendo',
          field: 'qtd_em_atendimento'
        },
        {
          name: 'qtd_resolvidos',
          label: 'Finalizados',
          field: 'qtd_resolvidos'
        },
        {
          name: 'qtd_por_usuario',
          label: 'Total',
          field: 'qtd_por_usuario'
        },
        {
          name: 'tme',
          label: 'T.M.E',
          field: 'tme',
          align: 'center',
          headerStyle: 'text-align: center !important',
          format: (v) => { return this.formatDuration(v) }
        },
        {
          name: 'tma',
          label: 'T.M.A',
          field: 'tma',
          align: 'center',
          headerStyle: 'text-align: center !important',
          format: (v) => { return this.formatDuration(v) }
        }
      ]
    }
  },
  watch: {
    '$q.dark.isActive' () {
      // necessário para carregar os gráficos com a alterçaão do mode (dark/light)
      this.$router.go()
    },
    '$q.screen.width' () {
      // necessário para carregar os gráficos com a alterçaão do mode (dark/light)
      this.setConfigWidth()
    }
  },
  computed: {
    cTmaFormat () {
      const tma = this.ticketsAndTimes.TMA || {}
      return this.formatDuration(tma)
    },
    cTmeFormat () {
      const tme = this.ticketsAndTimes.TME || {}
      return this.formatDuration(tme)
    }
  },
  methods: {
    formatDuration (ms) {
      const durationFormat = ms => {
        if (ms < 0) ms = -ms
        const time = {
          hour: Math.floor(ms / 3600000) % 24 || '0',
          minute: Math.floor(ms / 60000) % 60 || '0',
          segundo: Math.floor(ms / 1000) % 60 || '0'
        }
        console.log(time)
        return Object.entries(time)
          .filter(vals => vals[1] !== 0)
          .map(([key, val]) => `${val <= 9 ? '0' + val : val}`)
          .join(':')
      }
      return durationFormat(ms)
    },
    async listarFilas () {
      const { data } = await ListarFilas()
      this.filas = data
    },
    ErrorMessage (message) {
      return this.$q.notify({
        type: 'negative',
        progress: true,
        position: 'top',
        message: message,
        actions: [{
          icon: 'close',
          round: true,
          color: 'white'
        }]
      })
    },
    setConfigWidth () {
      const diffDays = differenceInDays(new Date(this.params.endDate), new Date(this.params.startDate))
      if (diffDays > 30) {
        this.configWidth = { horizontal: true, width: 2200 }
      } else {
        const actualWidth = this.$q.screen.width
        this.configWidth = { horizontal: true, width: actualWidth - (actualWidth < 768 ? 40 : 100) }
      }
    },
    async getDashTicketsAndTimes () {
      await GetDashTicketsAndTimes(this.params).then(res => {
        this.ticketsAndTimes = res.data[0]
      })
        .catch(err => {
          console.error(err)
        })
    },
    getDashTicketsQueue () {
      GetDashTicketsQueue(this.params).then(res => {
        this.ticketsQueue = res.data
        const series = []
        const labels = []
        this.ticketsQueue.forEach(e => {
          series.push(+e.qtd)
          labels.push(e.label)
        })
        this.ticketsQueueOptions.series = series
        this.ticketsQueueOptions.labels = labels
        this.$refs.ChartTicketsQueue.updateOptions(this.ticketsQueueOptions)
        this.$refs.ChartTicketsQueue.updateSeries(series, true)
      })
        .catch(err => {
          console.error(err)
        })
    },
    getDashTicketsUsers () {
      GetDashTicketsPerUsersDetail(this.params).then(res => {
        this.ticketsUsers = res.data
        const series = []
        const labels = []
        this.ticketsUsers.forEach(e => {
          console.log(e)
          if(e.name){
            series.push(+e.qtd_resolvidos)
            labels.push(e.name)
          }
        })
        this.ticketsUsersOptions.series = series
        this.ticketsUsersOptions.labels = labels
        this.$refs.ChartTicketsUsers.updateOptions(this.ticketsUsersOptions)
        this.$refs.ChartTicketsUsers.updateSeries(series, true)
      })
        .catch(err => {
          console.error(err)
        })
    },
    getDashTicketsEvolutionChannels () {
      GetDashTicketsEvolutionChannels(this.params)
        .then(res => {
          this.ticketsEvolutionChannels = res.data
          const dataLabel = groupBy({ ...this.ticketsEvolutionChannels }, 'dt_referencia')
          const labels = Object.keys(dataLabel)
          // .map(l => {
          //   return format(new Date(l), 'dd/MM')
          // })
          this.ticketsEvolutionChannelsOptions.labels = labels
          this.ticketsEvolutionChannelsOptions.xaxis.categories = labels
          const series = [{
            name: '',
            type: 'column',
            data: []
          }, {
            type: 'line',
            data: []
          }
          ]
          const dados = groupBy({ ...this.ticketsEvolutionChannels }, 'label')
          console.log(dados)
          this.ticketsEvolutionChannels.forEach(x=>{
            series[0].name = x.label
            series[0].data.push(x.qtd)
          })
          series[1].data = series[0].data
          this.ticketsEvolutionChannelsOptions.series = series
          this.$refs.ChartTicketsEvolutionChannels.updateOptions(this.ticketsEvolutionChannelsOptions)
          this.$refs.ChartTicketsEvolutionChannels.updateSeries(series, true)
        })
        .catch(error => {
          console.error(error)
        })
    },
    getDashTicketsEvolutionByPeriod () {
      GetDashTicketsEvolutionByPeriod(this.params)
        .then(res => {
          this.ticketsEvolutionByPeriod = res.data
          const series = [{
            name: 'Atendimentos',
            type: 'column',
            data: []
          }, {
            type: 'line',
            data: []
          }
          ]
          const labels = []
          this.ticketsEvolutionByPeriod.forEach(e => {
            series[0].data.push(+e.qtd)
            labels.push(e.label)
          })
          series[1].data = series[0].data
          this.ticketsEvolutionByPeriodOptions.labels = labels
          this.ticketsEvolutionByPeriodOptions.series = series
          this.$refs.ChartTicketsEvolutionByPeriod.updateOptions(this.ticketsEvolutionByPeriodOptions)
          this.$refs.ChartTicketsEvolutionByPeriod.updateSeries(series, true)
        })
        .catch(error => {
          console.error(error)
        })
    },
    getDashTicketsPerUsersDetail () {
      GetDashTicketsPerUsersDetail(this.params)
        .then(res => {
          this.ticketsPerUsersDetail = res.data.filter((x,y)=> x.name != null)
        })
        .catch(error => {
          console.error(error)
        })
    },
    async getDashData () {
      const diffDays = differenceInDays(new Date(this.params.endDate), new Date(this.params.startDate))
      if (diffDays > 90) {
        this.ErrorMessage('Limite de 90 dias ao gerar relatorio')
        return
      } else if (diffDays < 0) {
        this.params.endDate = this.params.startDate
        this.setConfigWidth()
        await this.getDashTicketsAndTimes()
        this.getDashTicketsUsers()
        this.getDashTicketsEvolutionChannels()
        this.getDashTicketsQueue()
        this.getDashTicketsEvolutionByPeriod()
        this.getDashTicketsPerUsersDetail()
      }
      this.setConfigWidth()
      await this.getDashTicketsAndTimes()
      this.getDashTicketsUsers()
      this.getDashTicketsEvolutionChannels()
      this.getDashTicketsQueue()
      this.getDashTicketsEvolutionByPeriod()
      this.getDashTicketsPerUsersDetail()
    }

  },
  beforeMount () {
    const mode = this.$q.dark.isActive ? 'dark' : 'light'
    const theme = {
      mode,
      palette: 'palette1',
      monochrome: {
        enabled: true,
        color: '#0288d1',
        shadeTo: mode,
        shadeIntensity: 0.95
      }

    }
    this.ticketsUsersOptions ={ ...this.ticketsUsersOptions, theme }
    this.ticketsQueueOptions = { ...this.ticketsQueueOptions, theme }
    this.ticketsChannelsOptions = { ...this.ticketsChannelsOptions, theme }
    this.ticketsEvolutionChannelsOptions = { ...this.ticketsEvolutionChannelsOptions, theme }
    this.ticketsEvolutionByPeriodOptions = { ...this.ticketsEvolutionByPeriodOptions, theme }
  },
  mounted () {
    this.listarFilas()
    this.getDashData()
  }
}
</script>

<style lang="scss" >
.apexcharts-theme-dark svg {
  background: none !important;
}

</style>
