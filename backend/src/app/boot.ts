import { Application } from "express";
import database from "./database";
import modules from "./modules";
import express from "./express";
import bullMQ from "./bull";
import waitForMySQLConnection from "./awaitMySQLConnection";

export default async function bootstrap(app: Application): Promise<void> {
  await waitForMySQLConnection();
  await express(app);
  await database(app);
  await modules(app);
  await bullMQ(app); // precisar subir na instancia dos bots
}