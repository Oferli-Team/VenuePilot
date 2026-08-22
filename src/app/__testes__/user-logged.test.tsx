import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserLogged } from "@/components/user-logged";
import { useSession } from "next-auth/react";

jest.mock("next-auth/react");

describe("<UserLogged/>", () => {
  it("should render the component with user name if logged", () => {
    // Mock da sessão para simular um usuário logado
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          name: "John Doe",
          email: "john@example.com",
          role: "USER",
        },
      },
    });

    render(<UserLogged />);

    const userNameElement = screen.getByText("Olá, John");
    expect(userNameElement).toBeInTheDocument();
  });

  it("should not render permition link if is USER role", async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          name: "John Doe",
          email: "john@example.com",
          role: "USER",
        },
      },
    });

    render(<UserLogged />);

    // Verificar se o nome do usuário está renderizado
    const userNameElement = screen.getByText(/Olá, John/i);
    expect(userNameElement).toBeInTheDocument();

    // Encontrar o botão dropdown
    const dropdownButton = screen.getByText("Olá, John");
    expect(dropdownButton).toBeInTheDocument();

    // Simular o clique para abrir o dropdown
    await userEvent.click(dropdownButton);

    // Esperar pela mudança de estado do dropdown
    const dropdownContent = await screen.findByText("Minha conta");
    expect(dropdownContent).toBeInTheDocument();

    const linkAdministrarTop = screen.getByText("Administrar TOP");
    expect(linkAdministrarTop).toHaveTextContent("Administrar TOP");
    expect(linkAdministrarTop).toHaveAttribute("href", "/manada/dashboard");

    const logoutButton = screen.getByText("Sair");
    expect(logoutButton).toBeInTheDocument();
  });

  it("should render permition link if user is SUPER_ADMIN", async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          name: "John Doe",
          email: "john@example.com",
          role: "SUPER_ADMIN",
        },
      },
    });

    render(<UserLogged />);

    // Verificar se o nome do usuário está renderizado
    const userNameElement = screen.getByText(/Olá, John/i);
    expect(userNameElement).toBeInTheDocument();

    // Encontrar o botão dropdown
    const dropdownButton = screen.getByText("Olá, John");
    expect(dropdownButton).toBeInTheDocument();

    // Simular o clique para abrir o dropdown
    await userEvent.click(dropdownButton);

    // Esperar pela mudança de estado do dropdown
    const dropdownContent = await screen.findByText("Minha conta");
    expect(dropdownContent).toBeInTheDocument();

    const linkAdministrarTop = screen.getByText("Administrar TOP");
    expect(linkAdministrarTop).toHaveTextContent("Administrar TOP");
    expect(linkAdministrarTop).toHaveAttribute("href", "/manada/dashboard");

    const linkPermition = await screen.findByText("Permissões");
    expect(linkPermition).toBeInTheDocument();
    expect(linkPermition).toHaveAttribute("href", "/manada/permissao");

    const logoutButton = screen.getByText("Sair");
    expect(logoutButton).toBeInTheDocument();
  });
});
