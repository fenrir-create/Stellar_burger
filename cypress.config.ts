import { defineConfig } from "cypress";
import codeCoverage from "@cypress/code-coverage/task"

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:8000",
    setupNodeEvents(on, config) {
      codeCoverage(on,config);
      return config;
    },
  },

  component: {
    devServer: {
      framework: "react",
      bundler: "webpack",
    },
  },
});
