import React, { useState, useEffect } from "react";
import { Button } from "devextreme-react";

const Info = ({
  item,
  targetChanges,
  mergeData,
  changeView,
  applyChanges,
}) => {
  // --------------------------------------------------------------------
  // declarations
  // --------------------------------------------------------------------
  const { Modulo, IdModulo, Disabled, Etiqueta } = mergeData || {};
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // functionalities for the component
  // --------------------------------------------------------------------
  const changeItem = () => applyChanges(item, { forSelected: { Disabled: false, Etiqueta: 'SELECTED' }, forUnselected: { Disabled: true, Etiqueta: 'UNSELECTED' } });
  // --------------------------------------------------------------------
  
  // --------------------------------------------------------------------
  // functionality for effects
  // --------------------------------------------------------------------
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // attach effects
  // --------------------------------------------------------------------
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // rendering
  // --------------------------------------------------------------------
  return (
    <>
      {
        <div>
          <Button icon="edit" onClick={changeView} />
          <Button icon="codeblock" onClick={changeItem} />
          <h2>{Modulo}</h2>
          <h5>{IdModulo}</h5>
          <h6>{Disabled ? 'DISABLED' : 'ENABLED'}</h6>
          <h6>{Etiqueta}</h6>
        </div>
      }
    </>
  );
  // --------------------------------------------------------------------
};

export default Info;



















// import React, { useState, useEffect } from "react";
// import { Button } from "devextreme-react";

// const Info = ({
//   item,
//   isSelected,
//   getSelected,
//   getChanges,
//   applyChanges,
//   // data: {
//   //   Modulo,
//   //   IdModulo,
//   //   Disabled, 
//   //   Etiqueta,
//   //   isSelected
//   // } = {},
//   // itemSelected,
//   changeView,
//   changeItem,
// }) => {
//   // --------------------------------------------------------------------
//   // declarations
//   // --------------------------------------------------------------------
//   const itemSelected = getSelected();
//   const { Modulo, IdModulo } = item;
//   const { Disabled, Etiqueta } = getChanges(item) || {};
//   // --------------------------------------------------------------------

//   // --------------------------------------------------------------------
//   // functionalities for the component
//   // --------------------------------------------------------------------
//   // --------------------------------------------------------------------
  
//   // --------------------------------------------------------------------
//   // functionality for effects
//   // --------------------------------------------------------------------
//   // --------------------------------------------------------------------

//   // --------------------------------------------------------------------
//   // attach effects
//   // --------------------------------------------------------------------
//   // --------------------------------------------------------------------

//   // --------------------------------------------------------------------
//   // rendering
//   // --------------------------------------------------------------------
//   return (() => {
//     return (
//       <>
//         {
//           <div>
//             <Button icon="edit" onClick={changeView} />
//             <Button icon="codeblock" onClick={changeItem} />
//             <h2>{Modulo}</h2>
//             <h5>{IdModulo}</h5>
//             { !!itemSelected && <h6>{Disabled ? 'DISABLED' : 'ENABLED'} - by changes</h6> }
//             { !!itemSelected && <h6>{isSelected(item) ? 'SELECTED' : 'NO SELECTED'} - by isSelected</h6> }
//             { !!itemSelected && <h6>{Etiqueta}</h6> }
//           </div>
//         }
//       </>
//     );
//   })();
//   // --------------------------------------------------------------------
// };

// export default Info;