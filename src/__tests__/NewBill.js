import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"

/*const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname });
};
//On indique que l'utilisateur est un Employee
Object.defineProperty(window, "localStorage", { value: localStorageMock });
window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));*/

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then, Loading page should be rendered", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
    })
  })
})