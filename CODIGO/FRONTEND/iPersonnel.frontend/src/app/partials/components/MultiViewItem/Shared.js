
const prefix = 'vcg'; 
export const sysMultiViewItemCssClass = `${prefix}-mvi`;                        // mvi: MultiViewItem
export const sysHorizontalSectionCssClass = `${sysMultiViewItemCssClass}-hs`;   // vcg-mvi-hs: MultiViewItem HorizontalSection
export const sysRowHeaderCssClass = `${sysMultiViewItemCssClass}-row-h`;        // vcg-mvi-row-h: MultiViewItem Row Header
export const sysHeaderCssClass = `${sysMultiViewItemCssClass}-h`;               // vcg-mvi-h: MultiViewItem Header
export const sysRowViewItemCssClass = `${sysMultiViewItemCssClass}-row-vi`;     // vcg-mvi-row-vi: MultiViewItem Row ViewItem (ViewItem <--- render del usuario)
export const sysRowFooterCssClass = `${sysMultiViewItemCssClass}-row-f`;        // vcg-mvi-row-f: MultiViewItem Row Footer
export const sysFooterCssClass = `${sysMultiViewItemCssClass}-f`;               // vcg-mvi-f: MultiViewItem Footer

// Nota:  Si se necesitase más tipos de vistas que las propuestas arriba, 
//        se sugiere crear una constante en el componente principal (es decir el componente que contendrá al componente MultiViewItem).
//        Constante como muestra el ejemplo abajo:
// const CustomViewItemType = {
//   ...CommonViewItemType,
//   OtherView1: 'otherView1',
//   OtherView2: 'otherView2',
//   OtherView3: 'otherView3',
//   .
//   .
//   .
//   OtherViewN: 'otherViewN',
// };
export const CommonViewItemType = {
  ViewContainer: 'ViewContainer',                   // Convención para hacer refenecia al contenedor de todas las vistas (por lo general valor inicial)
  DataView: 'DataView',                             // Para hacer referencia a la vista informativa (readOnly)
  DataEditor: 'DataEditor',                         // Para hacer referencia a un formulario para crear o editar
  SuccessMessageViewItem: 'SuccessMessageViewItem', // Mensaje de éxito.
  InfoMessageViewItem: 'InfoMessageViewItem',       // Mensaje de informacion.
  WarnMessageViewItem: 'WarnMessageViewItem',       // Mensaje de advertencia.
  ErrorMessageViewItem: 'ErrorMessageViewItem',     // Mensaje de error.
};

