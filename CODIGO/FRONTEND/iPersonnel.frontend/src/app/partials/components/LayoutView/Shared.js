
const prefix = 'vcg'; 
export const sysLayoutCssClass = `${prefix}-lyv`;                             // vcg-lyv          : LayoutView
export const sysViewContainerCssClass = `${sysLayoutCssClass}-vc`;            // vcg-lyv-vc       : LayoutView ViewContainer
export const sysHeaderCssClass = `${sysViewContainerCssClass}-h`;             // vcg-lyv-vc-h     : LayoutView ViewContainer Header
export const sysContentContainerCssClass = `${sysViewContainerCssClass}-cc`;  // vcg-lyv-vc-cc    : LayoutView ViewContainer ContentContainer
export const sysLeftCssClass = `${sysContentContainerCssClass}-l`;            // vcg-lyv-vc-cc-l  : LayoutView ViewContainer ContentContainer Left
export const sysCenterCssClass = `${sysContentContainerCssClass}-c`;          // vcg-lyv-vc-cc-c  : LayoutView ViewContainer ContentContainer Center
export const sysRightCssClass = `${sysContentContainerCssClass}-r`;           // vcg-lyv-vc-cc-r  : LayoutView ViewContainer ContentContainer Right
export const sysFooterCssClass = `${sysViewContainerCssClass}-f`;             // vcg-lyv-vc-f     : LayoutView ViewContainer Footer

// Layout:
//
//  ViewContainer
//   |___ Header
//   |___ ContentContainer
//   |     |___ Left
//   |     |___ Center
//   |     |___ Right
//   |___ Footer
//
export const SectionType = {
  ViewContainer: 'ViewContainer',       // Convención para hacer refenecia al contenedor de todas las secciones
  Header: 'Header',
  ContentContainer: 'ContentContainer', // Contenedor de las secciones (Left, Center y Right)
  Left: 'Left',
  Center: 'Center',
  Right: 'Right',
  Footer: 'Footer',
};
