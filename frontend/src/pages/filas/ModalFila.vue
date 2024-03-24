<template>
  <q-dialog
    persistent
    :value="modalFila"
    @hide="fecharModal"
    @show="abrirModal"
  >
    <q-card
      style="width: 500px"
      class="q-pa-lg"
    >
      <q-card-section>
        <div class="text-h6">{{ filaEdicao.id ? 'Editar': 'Criar' }} Fila</div>
      </q-card-section>
      <q-card-section>
        <q-input
          class="row col"
          square
          outlined
          v-model="fila.queue"
          label="Nome da Fila"
        />
        <q-checkbox
          v-model="fila.isActive"
          label="Ativo"
        />
      </q-card-section>
      <q-card-actions
        align="right"
        class="q-mt-md"
      >
        <q-btn
          flat
          label="Cancelar"
          color="negative"
          v-close-popup
          class="q-mr-md"
        />
        <q-btn
          flat
          label="Salvar"
          color="primary"
          @click="handleFila"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

</template>

<script>
import { CriarFila, AlterarFila } from 'src/service/filas'
export default {
  name: 'ModalFila',
  props: {
    modalFila: {
      type: Boolean,
      default: false
    },
    filaEdicao: {
      type: Object,
      default: () => {
        return { id: null }
      }
    },
    queueData: {
      type: Object
    }
  },
  data () {
    return {
      fila: {
        id: null,
        queue: null,
        isActive: true
      }
    }
  },
  methods: {
    resetarFila () {
      this.fila = {
        id: null,
        queue: null,
        isActive: true
      }
    },
    fecharModal () {
      this.resetarFila()
      this.$emit('update:filaEdicao', { id: null })
      this.$emit('update:modalFila', false)
    },
    abrirModal () {
      if (this.filaEdicao.id) {
        this.fila = { ...this.filaEdicao }
      } else {
        this.resetarFila()
      }
    },
    async handleFila () {
      try {
        for (let i = 0; i < this.queueData.length; i++) {
          if (this.fila.queue === this.queueData[i].queue) {
            this.$q.notify({
              type: 'info',
              progress: true,
              position: 'top',
              textColor: 'black',
              message: 'Não é possível criar uma fila já existente!',
              color: 'red',
              actions: [{
                icon: 'close',
                round: true,
                color: 'white'
              }]
            })
            return
          }
        }
        this.loading = true
        if (this.fila.id) {
          const { data } = await AlterarFila(this.fila)
          this.$emit('modal-fila:editada', data)
          this.$q.notify({
            type: 'info',
            progress: true,
            position: 'top',
            textColor: 'black',
            message: 'Etapa editada!',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        } else {
          const { data } = await CriarFila(this.fila)
          this.$emit('modal-fila:criada', data)

          this.$q.notify({
            type: 'positive',
            progress: true,
            position: 'top',
            message: 'Fila criada!',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        }
        this.loading = false
        this.fecharModal()
      } catch (error) {
        console.error(error)
        this.$notificarErro('Ocorreu um erro!', error)
      }
    }
  },
  created () {
    console.log(this.queueData)
  }

}
</script>

<style lang="scss" scoped>
</style>
