export const rewriteWifeVinculo = (value: string) => {
  if (value === 'Esposa') {
    return `da ${value}`
  }
  if (value === 'Outros' || value === '') return `do Contato`
  return `do ${value}`
}
