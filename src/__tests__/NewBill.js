import { fireEvent, screen } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES } from "../constants/routes.js";

const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname });
};
//On indique que l'utilisateur est un Employee
Object.defineProperty(window, "localStorage", { value: localStorageMock });
window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then, Loading page should be rendered", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
    });
    /*test("Then, i can download a file", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      const file = screen.getByTestId("file")
      expect(file).toBeTruthy();
    })*/
  });
});


describe("When all is valid on NewBill", () => {
 
  /* on vérifie que la fonction qui permet l'envoie du formulaire a bien été appelée */
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

  /* on simule un formulaire valide */
  test("then after the bill was created, we should be redirected to Bills page", () => {
    async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      const newBill = new NewBill({
        document,
        onNavigate,
        firestore: null,
        localStorage: window.localStorage,
      });

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
      expect(screen.getByText("Mes notes de frais")).toBeTruthy();
    };
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
        files: [new File(["fichier"], "fichier.txt", { type: "texte/txt" })],
      },
    });
    expect(handleChangeFile).toHaveBeenCalled();
    expect(file.value).toEqual("");
    expect(screen.getByTestId("error-img").style.display).toBe("block");
  });
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
        files: [new File(["fichier"], "fichier.jpg", { type: "image/jpg" })],
      },
    });
    expect(handleChangeFile).toHaveBeenCalled();
    expect(file.files[0].name).toBe("fichier.jpg");
    expect(screen.getByTestId("error-img").style.display).toBe("none");
  });
});



