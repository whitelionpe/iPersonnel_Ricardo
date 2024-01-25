import { cssClassType } from "../../../../../partials/components/BoxesGrid/BoxesGrid";

export const prefixHabitacion = 'HAB'; 
export const prefixCama = 'CAM'; 
export const ItemSectionType = {
  EditorContainer: 'editorContainer',
  Data: 'data',
  Configurator: 'configurator',
  Buttons: 'buttons',
};
export const ItemDataViewType = {
  Info: 'info',
  Editor: 'editor',
  Message: 'message',
};
export const ClassNameModulo = {
  'E': 'blanco',
  'S': 'corporate-blue',
  'N': cssClassType.Inactive,
  'V': cssClassType.Opaque50,
};
export const ClassNameHabitacion = {
  'E': 'blanco',
  'S': 'marron',
  'N': cssClassType.Inactive,
  'V': cssClassType.Opaque50,
};
export const toolTipTextTemplate = {
  DefineAsEmpty: 'Definir como Espacio Vacío',
  Configure: (target) => `Configurar ${target}`,
  Edit: (target) => `Editar ${target}`,
  Active: (target, masculino = true) => `${target} Activ${masculino?'o':'a'}`,
  Inactive: (target, masculino = true) => `${target} Inactiv${masculino?'o':'a'}`,
  DefineAsContent: (target) => `Definir como ${target}`,
};
export const buttonHintTextTemplate = {
  DataView: (target) => `Ver Información ${target}`,
  Configuration: (target) => `Ver Configuración ${target}`,
  Summary: (target) => `Ver Resumen ${target}`,
  DataEditor: (target) => `Editar información ${target}`,
  Configurator: (target) => `Configurar ${target}`,
};
export const buttonIcon = {
  DataView: "fab fa-readme",
  Configuration: "fas fa-cog",
  Summary: "far fa-chart-bar",
  DataEditor: "fas fa-pencil-alt",
  Configurator: "fas fa-cogs",
};
export const Actions = {
  LoadModulo: 'LoadModulo',
  GetCamas: 'GetCamas',
};












// const BotonHint = {
//   DataView: "Ver Información del Módulo",
//   Configuration: "Ver Configuración del Módulo",
//   Summary: "Ver Resumen del Módulo",
//   DataEditor: "Editar información del Módulo",
//   Configurator: "Configurar el Módulo",
// };
// const BotonIcon = {
//   DataView: "fab fa-readme",
//   Configuration: "fas fa-cog",
//   Summary: "far fa-chart-bar",
//   DataEditor: "fas fa-pencil-alt",
//   Configurator: "fas fa-cogs",
// };
// const ToolTip = {
//   DefineAsEmpty: 'Definir como Espacio Vacío',
//   Configure: 'Configurar Habitación',
//   Edit: 'Editar Habitación',
//   Active: 'Habitación Activa',
//   Inactive: 'Habitación Inactiva',
//   DefineAsContent: 'Definir como Habitación',
// };