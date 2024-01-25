import React, { useState } from "react";
import MultiViewItem, { CommonViewItemType as ViewType, SuccessMessageViewItem } from "../../../../../../partials/components/MultiViewItem";

import "./style.css";
import InfoWithLayoutView from "./Views/InfoWithLayoutView";

const ModuloItem = ({
  item,
  targetChanges,
  mergeData,
  applyChanges,
}) => {
  // --------------------------------------------------------------------
  // declarations
  // --------------------------------------------------------------------
  const uniqueDataField = 'type';
  const timeoutMesageView = 2000;
  const source = [ { type: ViewType.DataInfo }, { type: ViewType.DataEditor }, { type: ViewType.SuccessMessage }, { type: ViewType.ErrorMessage } ];
  const messageViews = [ { type: ViewType.SuccessMessage }, { type: ViewType.ErrorMessage } ];
  const redirectViewFromMessage = ({ selected }) => ( selected.type === ViewType.ErrorMessage ? { type: ViewType.DataEditor } : { type: ViewType.DataInfo } );
  
  const [viewItemSelected, setViewItemSelected] = useState({ type: ViewType.DataInfo });

  const changeView = () => { setViewItemSelected({ type: ViewType.SuccessMessage }); }

  const viewItemComponent = ({ viewItemData }) => {
    switch(viewItemData.type) {
      case ViewType.DataInfo:
        return (
          <InfoWithLayoutView item={item} 
            targetChanges={targetChanges}
            mergeData={mergeData}
            changeView={changeView}
            applyChanges={applyChanges}
          />
        );
        case ViewType.SuccessMessage:
          return (<SuccessMessageViewItem title="Éxito" message="Yeah!!!" />);
      default:
        return (<div>Nada!</div>);
    }
  };
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // functionalities for the component
  // --------------------------------------------------------------------
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
        <MultiViewItem source={source}
          selected={viewItemSelected}
          uniqueId={uniqueDataField}
          uniqueDataField={uniqueDataField}
          userData={item}
          viewItemComponent={viewItemComponent}
          messageViews={messageViews}
          redirectViewFromMessage={redirectViewFromMessage}
          timeoutMesageView={timeoutMesageView}
          // height={191}
        />
      }
    </>
  );
  // --------------------------------------------------------------------
};

export default ModuloItem;


















// import React, { useState, useEffect } from "react";
// import MultiViewItem, { CommonViewItemType as ViewType, SuccessMessageViewItem } from "../../components/MultiViewItem";
// import { Button } from "devextreme-react";

// import "./style.css";
// import Info from "./Views/Info";

// const ModuloItem = ({
//   item,
//   isSelected,
//   getSelected,
//   getChanges,
//   applyChanges,
// }) => {
//   // --------------------------------------------------------------------
//   // declarations
//   // --------------------------------------------------------------------
//   // const [xxxxxxxxx, setXxxxxxxxx] = useState();
//   const { Modulo, IdModulo } = item;

//   const source = [ { type: ViewType.DataInfo }, { type: ViewType.DataEditor }, { type: ViewType.SuccessMessage }, { type: ViewType.ErrorMessage } ];
//   const uniqueDataField = 'type';
//   const [viewItemSelected, setViewItemSelected] = useState({ type: ViewType.DataInfo });
//   const messageViews = [ { type: ViewType.SuccessMessage }, { type: ViewType.ErrorMessage } ];
//   const timeoutMesageView = 2000;
//   const redirectViewFromMessage = ({ selected }) => ( selected.type === ViewType.ErrorMessage ? { type: ViewType.DataEditor } : { type: ViewType.DataInfo } );

//   const changeView = () => { setViewItemSelected({ type: ViewType.SuccessMessage }); }
//   // const changeItem = () => { applyChanges(item, { forSelected: { Disabled: false, Etiqueta: 'SELECTED' }, forUnselected: { Disabled: true, Etiqueta: 'UNSELECTED' } }); }
//   const changeItem = () => { applyChanges(item, { forSelected: { Disabled: false, Etiqueta: 'SELECTED' } }); }

//   const viewItemComponent = ({ viewItemData }) => {
//     // const { forSelected, forUnselected } = changes || {};
//     // const { Disabled, Etiqueta } = !!itemSelected ? ((isSelected(item) ? forSelected : forUnselected) || {}) : {};
//     // console.log("viewItemComponent -> viewItemData, viewItemIndex", viewItemData, viewItemIndex);
//     switch(viewItemData.type) {
//       case ViewType.DataInfo:
//         return (
//           <Info item={item} 
//             isSelected={isSelected} 
//             getSelected={getSelected} 
//             getChanges={getChanges} 
//             applyChanges={applyChanges} 
//             changeView={changeView} 
//             changeItem={changeItem}
//           />
//         );
//         // return (
//         //   <div>
//         //     <Button icon="edit" onClick={changeView} />
//         //     <Button icon="codeblock" onClick={changeItem} />
//         //     <h2>{Modulo}</h2>
//         //     <h5>{IdModulo}</h5>
//         //     { !!itemSelected && <h6>{Disabled ? 'DISABLED' : 'ENABLED'} - by changes</h6> }
//         //     { !!itemSelected && <h6>{isSelected ? 'SELECTED' : 'NO SELECTED'} - by isSelected</h6> }
//         //     { !!itemSelected && <h6>{Etiqueta}</h6> }
//         //   </div>
//         // );
//         case ViewType.SuccessMessage:
//           return (<SuccessMessageViewItem title="Éxito" message="Yeah!!!" />);
//       default:
//         return undefined;
//     }
//   };
//   // --------------------------------------------------------------------

//   // --------------------------------------------------------------------
//   // functionalities for the component
//   // --------------------------------------------------------------------
//   // --------------------------------------------------------------------
  
//   // --------------------------------------------------------------------
//   // functionality for effects
//   // --------------------------------------------------------------------
//   // const performOnAfterChangedXXXXXXXXX = () => {
//   // }
//   // --------------------------------------------------------------------

//   // --------------------------------------------------------------------
//   // attach effects
//   // --------------------------------------------------------------------
//   // useEffect(performOnAfterChangedXXXXXXXXX, [xxxxxxxxx]);
//   // useEffect(() => {
//   //   if (isSelected) console.log('itemSelected -->', itemSelected);
//   // }, [isSelected, itemSelected]);
//   // --------------------------------------------------------------------
  
//   // --------------------------------------------------------------------
//   // rendering
//   // --------------------------------------------------------------------
//   return (
//     <>
//       {
//         <MultiViewItem source={source}
//           selected={viewItemSelected}
//           uniqueId={uniqueDataField}
//           uniqueDataField={uniqueDataField}
//           userData={item}
//           viewItemComponent={viewItemComponent}
//           messageViews={messageViews}
//           redirectViewFromMessage={redirectViewFromMessage}
//           timeoutMesageView={timeoutMesageView}
//         />
//       }
//     </>
//   );
//   // --------------------------------------------------------------------
// };

// export default ModuloItem;