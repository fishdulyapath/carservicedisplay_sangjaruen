import { defineStore } from 'pinia'
export const useApp = defineStore("app", {

  state: () => ({
    PageTitle: "SC",
    pageActive: "updatelist",
    childActive: "",
    showToggle: true,
  })
  ,
  actions: {
    async setPageTitle(title) {
      this.PageTitle = title;
      document.title = title + " - " + process.env.VUE_APP_TITLE;
    },
    async setActivePage(page) {
      this.pageActive = page;
    },
    async setActiveChild(page) {
      this.childActive = page;
    },
    async setActivedToggle() {
      if (this.showToggle == true) {
        this.showToggle = false;
      } else {
        this.showToggle = true;
      }
    }
  },
});
