import { fireEvent, screen } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES } from "../constants/routes.js";
import firebase from "../__mocks__/firebase.js";
import BillsUI from "../views/BillsUI.js";

const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname });
};
//On indique que l'utilisateur est un Employee
Object.defineProperty(window, "localStorage", { value: localStorageMock });
window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));

/* on vérifie que le formulaire s'affiche bien */
describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then, Loading page should be rendered", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
    });

    // test de la fonction handleSubmit(permet l'envoie du formulaire de note de frais)
    test("Then the submit function handleSubmit should be called", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      const newBill = new NewBill({
        document,
        onNavigate,
        firestore: null,
        localStorage: window.localStorage,
      });
      const handleSubmit = jest.fn(newBill.handleSubmit);
      const formNewBill = screen.getByTestId("form-new-bill");
      formNewBill.addEventListener("submit", handleSubmit);
      fireEvent.submit(formNewBill);
      expect(handleSubmit).toBeCalled();
    });

    /* on vérifie ce qu il se passe en cas d'import de document conforme */
    describe("When i choose the good format file ", () => {
      test("then the file is upload", async () => {
        const html = NewBillUI();
        document.body.innerHTML = html;

        const firestore = {
          storage: {
            ref: () => ({
              put: () =>
                Promise.resolve({
                  ref: {
                    getDownloadURL: jest.fn(),
                  },
                }),
            }),
          },
        };

        const newBill = new NewBill({
          document,
          onNavigate,
          firestore,
          localStorage: window.localStorage,
        });

        const handleChangeFile = jest.fn(newBill.handleChangeFile);
        const file = screen.getByTestId("file");
        file.addEventListener("change", handleChangeFile);
        fireEvent.change(file, {
          target: {
            files: [
              new File(["fichier"], "fichier.jpg", { type: "image/jpg" }),
            ],
          },
        });
        expect(handleChangeFile).toHaveBeenCalled();
        expect(file.files[0].name).toBe("fichier.jpg");
        expect(screen.getByTestId("error-img").style.display).toBe("none");
      });
    });

    /* on vérifie que le message d'erreur s'affiche bien en cas d'import de document non conforme */
    describe("When i choose a file that does not match the supported formats ", () => {
      test("Then a error message should be display", async () => {
        const html = NewBillUI();
        document.body.innerHTML = html;
        const newBill = new NewBill({
          document,
          onNavigate,
          firestore: null,
          localStorage: window.localStorage,
        });
        const handleChangeFile = jest.fn(() => newBill.handleChangeFile);
        const file = screen.getByTestId("file");
        file.addEventListener("change", handleChangeFile);
        fireEvent.change(file, {
          target: {
            files: [
              new File(["fichier"], "fichier.txt", { type: "texte/txt" }),
            ],
          },
        });
        expect(handleChangeFile).toHaveBeenCalled();
        expect(file.value).toEqual("");
        expect(screen.getByTestId("error-img").style.display).toBe("block");
      });
    });

    describe("When all is valid on NewBill", () => {
      // on test qu'on retourne bien sur la page bills après l'envoie d'un formulaire valide
      test("then after the bill was created, we should be redirected to Bills page", async () => {
        const html = NewBillUI();
        document.body.innerHTML = html;
        const newBill = new NewBill({
          document,
          onNavigate,
          firestore: null,
          localStorage: window.localStorage,
        });
        const formNewBill = screen.getByTestId("form-new-bill");
        const bill = {
          type: "Transports",
          name: "Test the Bill",
          amount: 200,
          date: "2020-06-22",
          vat: 40,
          pct: 12,
          commentary: "...",
          fileUrl: "imgTest.png",
          fileName: "imgTest.png",
        };
        const handleSubmit = jest.fn(newBill.handleSubmit);
        newBill.createBill = (newBill) => newBill;
        screen.getByTestId("expense-type").value = bill.type;
        screen.getByTestId("expense-name").value = bill.name;
        screen.getByTestId("amount").value = bill.amount;
        screen.getByTestId("datepicker").value = bill.date;
        screen.getByTestId("vat").value = bill.vat;
        screen.getByTestId("pct").value = bill.pct;
        screen.getByTestId("commentary").value = bill.commentary;
        newBill.fileUrl = bill.fileUrl;
        newBill.fileName = bill.fileName;

        formNewBill.addEventListener("click", handleSubmit);
        fireEvent.click(formNewBill);
        expect(handleSubmit).toHaveBeenCalled();
        expect(screen.getByText("Mes notes de frais")).toBeTruthy();
      });
    });
  });
  
  /* test d'intégration POST */
  describe("Given, i am connected as Employee", () => {
    describe("When i post a bill", () => {
      test("Then number of bills fetched should changed from 4 to 5 ", async () => {
        const post = jest.spyOn(firebase, "post");
        const newPost = {
          id: "qcEZGFSzhthteZAGRrHjaC",
          status: "refused",
          pct: 50,
          amount: 400,
          email: "monemail@email.com",
          name: "urgent",
          vat: "80",
          fileName: "facture-screenshot.jpg",
          date: "2009-12-02",
          commentAdmin: "facture du mois de décembre",
          commentary: "test post",
          type: "Restaurants et bars",
          fileUrl:
            "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…dur.png?alt=media&token=571d34cb-9c8f-430a-af52-66221cae1da3",
        };
        const newBillList = await firebase.post(newPost);
        expect(post).toHaveBeenCalledTimes(1);
        expect(newBillList.data.length).toBe(5);
      });

      /* erreur 404 */
      test("Then it return error 404 ", async () => {
        firebase.post(() => Promise.reject(new Error("Erreur 404")));
        const html = BillsUI({ error: "Erreur 404" });
        document.body.innerHTML = html;
        const errorMessage = screen.getByText(/Erreur 404/);
        expect(errorMessage).toBeTruthy();
      });

      /* erreur 500 */
      test("Then it return error 500", async () => {
        firebase.post(() => Promise.reject(new Error("Erreur 404")));
        const html = BillsUI({ error: "Erreur 500" });
        document.body.innerHTML = html;
        const errorMessage = screen.getByText(/Erreur 500/);
        expect(errorMessage).toBeTruthy();
      });
    });
  });
});
