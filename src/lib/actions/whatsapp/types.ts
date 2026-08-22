type TemplateBodyVariables = {
  type: "text";
  text: string;
};

export type TemplateBody = {
  type: "body";
  parameters: TemplateBodyVariables[];
};

export type TemplateButton = {
  type: "button";
  sub_type: "URL";
  index: string;
  parameters: TemplateBodyVariables[];
};

export type TemplateMessage = {
  number: string;
  name: string;
  language: "pt_BR";
  components: (TemplateBody | TemplateButton)[];
};
