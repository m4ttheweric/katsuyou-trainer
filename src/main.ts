import Alpine from "alpinejs";
import { verbTrainer } from "./verb-trainer.ts";
import "./styles.css";

declare global {
  interface Window {
    Alpine: typeof Alpine;
    verbTrainer: typeof verbTrainer;
  }
}

window.Alpine = Alpine;
window.verbTrainer = verbTrainer;

document.addEventListener("alpine:init", () => {
  Alpine.store("quizTick", 0);
});

Alpine.start();
