import { QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.query(
      `
      INSERT INTO Whatsapps (id, session, qrcode, status, battery, plugged, createdAt, updatedAt, name, isDefault, retries, tenantId, phone, number, isDeleted, tokenTelegram, type, instagramUser, instagramKey, tokenHook, tokenAPI, wabaBSP, isActive, fbPageId, fbObject, greetingMessage, farewellMessage) VALUES (1, '', '', 'DISCONNECTED', '20', false, '2021-03-11 23:23:17.000', '2022-08-09 22:54:09.133', 'Whatsapp 01', true, 0, 1, JSON_OBJECT(), '', false, NULL, 'whatsapp', NULL, NULL, '', NULL, NULL, true, NULL, NULL, 'Olá, meu nome é *{{nomeatendente}}* e vou dar prosseguimento no atendimento. _Atendimento nº *{{atendimentonumero}}*_', NULL);
      INSERT INTO Whatsapps (id, session, qrcode, status, battery, plugged, createdAt, updatedAt, name, isDefault, retries, tenantId, phone, number, isDeleted, tokenTelegram, type, instagramUser, instagramKey, tokenHook, tokenAPI, wabaBSP, isActive, fbPageId, fbObject, greetingMessage, farewellMessage) VALUES(2, '', '', 'DISCONNECTED', '20', false, '2021-03-11 23:23:17.000', '2022-07-19 16:19:59.332', 'Instagram 01', false, 0, 1, JSON_OBJECT(), '', false, NULL, 'instagram', NULL, NULL, '', NULL, NULL, true, NULL, NULL, 'Olá, meu nome é *{{nomeatendente}}* e vou dar prosseguimento no atendimento. _Atendimento nº *{{atendimentonumero}}*_', NULL);
      INSERT INTO Whatsapps (id, session, qrcode, status, battery, plugged, createdAt, updatedAt, name, isDefault, retries, tenantId, phone, number, isDeleted, tokenTelegram, type, instagramUser, instagramKey, tokenHook, tokenAPI, wabaBSP, isActive, fbPageId, fbObject, greetingMessage, farewellMessage) VALUES(3, '', '', 'DISCONNECTED', '20', false, '2021-03-11 23:23:17.000', '2022-07-19 15:55:28.096', 'Telegram 01', false, 0, 1, JSON_OBJECT(), '', false, NULL, 'telegram', NULL, NULL, '', NULL, NULL, true, NULL, NULL, 'Olá, meu nome é *{{nomeatendente}}* e vou dar prosseguimento no atendimento. _Atendimento nº *{{atendimentonumero}}*_', NULL);
      INSERT INTO Whatsapps (id, session, qrcode, status, battery, plugged, createdAt, updatedAt, name, isDefault, retries, tenantId, phone, number, isDeleted, tokenTelegram, type, instagramUser, instagramKey, tokenHook, tokenAPI, wabaBSP, isActive, fbPageId, fbObject, greetingMessage, farewellMessage) VALUES(4, '', '', 'DISCONNECTED', '20', false, '2021-03-11 23:23:17.000', '2022-07-19 15:55:28.096', 'Messenger 01', false, 0, 1, JSON_OBJECT(), '', false, NULL, 'messenger', NULL, NULL, '', NULL, NULL, true, NULL, NULL, 'Olá, meu nome é *{{nomeatendente}}* e vou dar prosseguimento no atendimento. _Atendimento nº *{{atendimentonumero}}*_', NULL);
      `
    );
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Whatsapps", {});
  }
};
