import { act, render } from "@testing-library/react";
import {
  initialFormData,
  useFormStore,
} from "@/components/participante/useFormStore";
import { usePathname } from "next/navigation";
import { CheckAndResetFormData } from "@/components/layout/check-and-reset-formData";
import { StepsRegisterProvider } from "../hook/useStepsRegister";
import { StepsServirProvider } from "../hook/useStepsServir";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

describe("FormData Context", () => {
  let resetFormStoreMock: jest.Mock;

  beforeEach(() => {
    resetFormStoreMock = jest.fn(() => {
      useFormStore.setState({ formData: initialFormData });
    });
    useFormStore.setState({
      formData: initialFormData,
      resetFormStore: resetFormStoreMock,
    });
  });

  it("should start formData with empty fields state", () => {
    const state = useFormStore.getState();

    expect(state.formData).toEqual(initialFormData);
  });

  it("ensures formData contains expected values when route is '/participar'", () => {
    (usePathname as jest.Mock).mockImplementation(() => "/participar");

    act(() => {
      render(
        <StepsRegisterProvider>
          <StepsServirProvider>
            <CheckAndResetFormData />
          </StepsServirProvider>
        </StepsRegisterProvider>,
      );
    });

    useFormStore.setState({
      formData: {
        ...initialFormData,
        cpf: "99999999999",
        nome: "Teste",
        email: "teste@teste.com",
      },
    });

    const state = useFormStore.getState();

    expect(state.formData).toEqual({
      ...initialFormData,
      cpf: "99999999999",
      nome: "Teste",
      email: "teste@teste.com",
    });
  });

  it("should reset data when the route changes", () => {
    (usePathname as jest.Mock).mockImplementation(() => "/");

    useFormStore.setState({
      formData: {
        ...initialFormData,
        cpf: "99999999999",
        nome: "Teste",
        email: "teste@teste.com",
      },
    });

    act(() => {
      render(
        <StepsRegisterProvider>
          <StepsServirProvider>
            <CheckAndResetFormData />
          </StepsServirProvider>
        </StepsRegisterProvider>,
      );
    });

    const state = useFormStore.getState();

    expect(resetFormStoreMock).toHaveBeenCalled();
    expect(state.formData).toEqual(initialFormData);
  });
});
