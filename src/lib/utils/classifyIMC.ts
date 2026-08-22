export const classifyIMC = (imc: number) => {
  if (isNaN(imc)) {
    return {
      classification: "IMC inválido",
      textColor: "text-black",
      backgroundColor: "bg-white/30",
    };
  }
  if (imc < 18.5) {
    return {
      classification: "Abaixo do peso",
      textColor: "text-blue-600",
      backgroundColor: "bg-blue-600/10",
    };
  }
  if (imc < 25) {
    return {
      classification: "Peso normal",
      textColor: "text-green-600",
      backgroundColor: "bg-green-700/10",
    };
  }
  if (imc < 30) {
    return {
      classification: "Sobrepeso",
      textColor: "text-yellow-600",
      backgroundColor: "bg-yellow-700/10",
    };
  }
  if (imc < 35) {
    return {
      classification: "Obesidade Grau I",
      textColor: "text-red-500",
      backgroundColor: "bg-red-600/10",
    };
  }
  if (imc < 40) {
    return {
      classification: "Obesidade Grau II",
      textColor: "text-red-800",
      backgroundColor: "bg-red-700/10",
    };
  }
  return {
    classification: "Obesidade Grau III",
    textColor: "text-red-800",
    backgroundColor: "bg-red-900/5",
  };
};
