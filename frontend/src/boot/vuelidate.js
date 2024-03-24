import Vuelidate from 'vuelidate'
import VuelidateErrorExtractor from 'vuelidate-error-extractor'

import linkify from 'vue-linkify'

/* We need messages for validation */
const messages = {
  required: '{attribute} é obrigatório',
  email: '{attribute} é inválido.',
  minValue: '{attribute} deve ser maior que {min}',
  minLength: '{attribute} deve possuir no mínimo {min} carateres',
  maxLength: '{attribute} deve possuir no máximo {max} carateres',
  validaData: 'Data inválida'
}

const mapNames = {
  email: 'E-mail',
  name: 'Nome',
  nome: 'Nome',
  username: 'Usuário'
}

export default ({
  Vue
}) => {
  Vue.directive('linkified', linkify)
  Vue.use(Vuelidate)
  Vue.use(VuelidateErrorExtractor, {
    messages,
    attributes: mapNames
  })
}
