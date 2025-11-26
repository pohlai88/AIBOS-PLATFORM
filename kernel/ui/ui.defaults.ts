export function defaultUIForModel(metadata: any) {
  const fields = metadata.fields;

  return {
    form: {
      layout: "single-column",
      fields: Object.fromEntries(
        Object.entries(fields).map(([name, field]) => [
          name,
          defaultComponentForField(field)
        ])
      )
    },
    table: {
      columns: Object.keys(fields)
    }
  };
}

function defaultComponentForField(field: any) {
  switch (field.type) {
    case "string":
      return { component: "TextInput" };
    case "number":
      return { component: "NumberInput" };
    case "enum":
      return { component: "Select", options: field.values };
    case "reference":
      return { component: "ReferencePicker", ref: field.ref };
    case "datetime":
      return { component: "DateTimePicker" };
    case "uuid":
      return { component: "TextInput", readonly: true };
    case "boolean":
      return { component: "Checkbox" };
    default:
      return { component: "TextInput" };
  }
}

