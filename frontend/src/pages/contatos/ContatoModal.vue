<template>
  <q-dialog
    persistent
    @show="fetchContact"
    @hide="$emit('update:modalContato', false)"
    :value="modalContato"
  >
    <q-card
      class="q-pa-lg"
      style="min-width: 700px"
    >
      <q-card-section>
        <div class="text-h6">
          {{ contactId ? 'Editar Contato' : 'Adicionar Contato'  }}
        </div>
      </q-card-section>
      <q-card-section class="q-pa-sm q-pl-md text-bold">
        Dados Contato
      </q-card-section>
      <q-card-section class="q-pa-sm q-pl-md row q-col-gutter-md">
        <c-input
          class="col-6"
          outlined
          v-model="contato.name"
          :validator="$v.contato.name"
          @blur="$v.contato.name.$touch"
          label="Nome"
        />
        <c-input
          class="col-6"
          outlined
          v-model="contato.number"
          :validator="$v.contato.number"
          @blur="$v.contato.number.$touch"
          mask="(##) ########"
          placeholder="(DDD) 99999 - 9999"
          fill-mask
          unmasked-value
          hint="Número do contato deverá conter 8 dígitos e ser precedido do DDD. "
          label="Número"
        />
        <c-input
          class="col-12"
          outlined
          :validator="$v.contato.email"
          @blur="$v.contato.email.$touch"
          v-model="contato.email"
          label="E-mail"
        />
      </q-card-section>
      <q-card-section class="q-pa-sm q-pl-md text-bold">
        Informações adicionais
      </q-card-section>
      <q-card-section class="q-pa-sm q-pl-md text-bold">
        <div v-for="(extraInfo, index) in contato.extraInfo" :key="index">
          <q-input
          class="col-6"
          outlined
          v-model="extraInfo.value"
          label="Descrição"
          type="textarea"
        />
        </div>
      </q-card-section>
      <q-card-actions
        align="right"
        class="q-mt-lg"
      >
        <q-btn
          flat
          label="Sair"
          color="negative"
          v-close-popup
          class="q-px-md "
          @click="removeContact"
        />
        <q-btn
          class="q-ml-lg q-px-md"
          flat
          label="Salvar"
          color="primary"
          @click="saveContact"
          :disable="disableButton"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script>
import { required, email, minLength, maxLength } from 'vuelidate/lib/validators'
import { ObterContato, CriarContato, EditarContato } from 'src/service/contatos'
export default {
  name: 'ContatoModal',
  props: {
    modalContato: {
      type: Boolean,
      default: false
    },
    contactId: {
      type: Number,
      default: null
    }
  },
  data () {
    return {
      contato: {
        name: null,
        number: null,
        email: '',
        extraInfo: [{
          name: '',
          value: ''
        }]
      },
      disableButton: false
    }
  },
  validations: {
    contato: {
      name: { required, minLength: minLength(3), maxLength: maxLength(50) },
      email: { email },
      number: { required, minLength: minLength(8) }
    }
  },
  methods: {
    async fetchContact () {
      if (!this.contactId) return
      try {
        const { data } = await ObterContato(this.contactId)
        this.contato = data
        if (data.number.substring(0, 2) === '55') {
          this.contato.number = data.number.substring(2)
        }
        if (!data.extraInfo.length > 0) {
          this.contato.extraInfo.push({ name: '', value: ' ' })
        }
      } catch (error) {
        console.error(error)
        this.$notificarErro('Ocorreu um erro!', error)
      }
    },
    removeExtraInfo (index) {
      const newData = { ...this.contato }
      newData.extraInfo.splice(index, 1)
      this.contato = { ...newData }
    },
    async removeContact () {
      this.contato = {
        name: null,
        namber: null,
        email: '',
        extraInfo: [{
          name: null,
          value: null
        }]
      }
    },
    async saveContact () {
      this.$v.contato.$touch()
      if (this.$v.contato.$error) {
        return this.$q.notify({
          type: 'warning',
          progress: true,
          position: 'top',
          message: 'Ops! Verifique os erros...',
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
      }
      var contato = {
        ...this.contato,
        number: '55' + this.contato.number // inserir o DDI do brasil para consultar o número
      }
      if (this.contato.extraInfo.name === null) {
        this.contato.extraInfo.name = ''
      }
      try {
        this.disableButton = true
        if (this.contactId) {
          const { data } = await EditarContato(this.contactId, contato)
          console.log(data)
          this.$emit('contatoModal:contato-editado', data)
          this.$q.notify({
            type: 'info',
            progress: true,
            position: 'top',
            textColor: 'black',
            message: 'Contato editado!',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
          this.disableButton = false
        } else {
          const { data } = await CriarContato(contato)
          this.$q.notify({
            type: 'positive',
            progress: true,
            position: 'top',
            message: 'Contato criado!',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
          this.$emit('contatoModal:contato-criado', data)
          this.disableButton = false
        }
        this.disableButton = false
        this.$emit('update:modalContato', false)
      } catch (error) {
        console.error(error)
        this.disableButton = false
        this.$notificarErro('Ocorreu um erro ao criar o contato', error)
      }
    }

  },
  destroyed () {
    this.$v.contato.$reset()
  }
}
</script>

<style lang="scss" scoped>
</style>
