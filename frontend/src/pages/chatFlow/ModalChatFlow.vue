<template>
  <q-dialog
    :value="modalChatFlow"
    @hide="fecharModal"
    @show="abrirModal"
    persistent
  ><q-inner-loading
        :showing="visible"
        label="Please wait..."
        label-class="text-teal"
        label-style="font-size: 1.1em"
      />
    <q-card
      style="width: 700px"
      class="q-pa-lg"
    ><div
          v-if="chatFlow.isBlocked"
          class="text-subtitle1"
        > {{"Certeza que deseja deletar o fluxo?"}}
      <q-btn
          flat
          label="Não"
          color="negative"
          v-close-popup
          class="q-mr-md"
      />
      <q-btn
          flat
          label="Sim"
          color="primary"
          @click="handleAutoresposta"
      />
      </div>
    <div v-if="!chatFlow.isBlocked">
      <q-card-section>
        <div class="text-h6">{{ chatFlow.isDuplicate ? 'Duplicar' : chatFlowEdicao.id ? 'Editar': 'Criar'}} Fluxo <span v-if="chatFlow.isDuplicate"></span></div>
        <div
          v-if="chatFlow.isDuplicate"
          class="text-subtitle1"
        > Nome: {{ chatFlowEdicao.name }} </div>
      </q-card-section>
      <q-card-section>
        <q-input
          class="row col"
          square
          outlined
          v-model="chatFlow.name"
          label="Descrição"
        />
        <!-- <div class="row col q-mt-md">
          <q-option-group
            v-model="chatFlow.action"
            :options="options"
            color="primary"
          />
        </div> -->
        <div class="row col q-mt-md">
          <q-checkbox
            v-model="chatFlow.isActive"
            label="Ativo"
          />
        </div>
        <div class="row col q-mt-md">
          <q-input
            clearable
            class="full-width"
            square
            outlined
            v-model="chatFlow.celularTeste"
            label="Número para Teste"
            hint="Deixe limpo para que a Auto resposta funcione. Caso contrário, irá funcionar somente para o número informado aqui."
          />
        </div>
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
          @click="handleAutoresposta"
        />
      </q-card-actions>
    </div>
    </q-card>
  </q-dialog>

</template>

<script>
const userId = +localStorage.getItem('userId')
import { CriarChatFlow, UpdateChatFlow, ListarChatFlow } from 'src/service/chatFlow'
import { getDefaultFlow } from 'src/components/ccFlowBuilder/defaultFlow'

export default {
  name: 'ModalNovoChatFlow',
  props: {
    modalChatFlow: {
      type: Boolean,
      default: false
    },
    chatFlowEdicao: {
      type: Object,
      default: () => {
        return { id: null }
      }
    }
  },
  data () {
    return {
      chatFlow: {
        name: null,
        userId,
        celularTeste: null,
        isActive: true,
        isBlocked: false
      }
      // options: [
      //   { value: 0, label: 'Entrada (Criação do Ticket)' },
      //   { value: 1, label: 'Encerramento (Resolução Ticket)' }
      // ]
    }
  },
  methods: {
    abrirModal () {
      if (this.chatFlowEdicao.id) {
        this.chatFlow = {
          ...this.chatFlowEdicao,
          userId
        }
      } else {
        this.chatFlow = {
          name: null,
          action: 0,
          userId,
          celularTeste: null,
          isActive: true
        }
      }
    },
    fecharModal () {
      this.chatFlow = {
        name: null,
        action: 0,
        userId,
        celularTeste: null,
        isActive: true
      }
      this.$emit('update:chatFlowEdicao', { id: null })
      this.$emit('update:modalChatFlow', false)
    },
    async handleAutoresposta () {
      if (this.chatFlow.id && this.chatFlow?.isBlocked === true) {
        await UpdateChatFlow(this.chatFlow)
        const { data } = await ListarChatFlow()
        console.log('adentrou')
        this.$notificarSucesso('Fluxo Deletado.')
        this.$emit('chatFlow:listado', data)
      }else if (this.chatFlow.id && !this.chatFlow?.isDuplicate && this.chatFlow?.isBlocked === false) {
        const { data } = await UpdateChatFlow(this.chatFlow)
        console.log(adentrou2)
        this.$notificarSucesso('Fluxo editado.')
        this.$emit('chatFlow:editado', data)
      } else {
        // setar id = null para rotina de duplicação de fluxo
        const flow = { ...getDefaultFlow(), ...this.chatFlow, id: null }
        const { data } = await CriarChatFlow(flow)
        this.$notificarSucesso('Novo fluxo criado.')
        this.$emit('chatFlow:criada', data)
      }
      this.fecharModal()
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
