import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl"; 
import Toolbar, { Item } from "devextreme-react/toolbar";

import "./style.css";
import { ItemSectionType } from "../../../../Shared";
import { isFunction } from "../../../../../../../../../../partials/shared/CommonHelper";

const HabitacionItemEditorBotonera = ({
  parent,
  item,
  pk,
  visible = true,
  toolbar,
  selectItemInEdit,
  intl,
}) => {
  const buttonOptions = ({ icon, tooltip: hint, disabled = false, onClick }) => ({ icon, hint, disabled, onClick});
  const [ { text: headerTitle }, edit, save, cancel, { text: rowTitle }, addRow, difRow, { text: colTitle }, addCol, difCol, ] = toolbar;
  
  const [showEdit, setShowEdit] = useState(item.SectionType !== ItemSectionType.Configurator);
  const [disabled, setDisabled] = useState(item.SectionType !== ItemSectionType.Configurator);

  const extendButtonFunctionality = (button, callback = undefined) => ({ ...button, onClick: () => { if (isFunction(button.onClick)) button.onClick(item); if (isFunction(callback)) callback() }, });

  const performForEdit = () => {
    setShowEdit(false);
    selectItemInEdit(parent, { forSelected: { Disabled: false, SectionType: ItemSectionType.Configurator, Habitacion: undefined }, forUnselected: { Disabled: true, SectionType: undefined, Habitacion: undefined } });
  }
  const performForSave = () => {
    setShowEdit(true);
  }
  const performForCancel = () => {
    setShowEdit(true);
  }

  const newEdit = extendButtonFunctionality(edit, performForEdit);
  const newSave = extendButtonFunctionality(save, performForSave);
  const newCancel = extendButtonFunctionality(cancel, performForCancel);

  useEffect(() => {
    if (!item.SectionType) setDisabled(false);
    else setDisabled(!!!item.DetailSectionType);
  }, [parent.DetailSectionType]);

  return (
    <>
      {
        !!visible && !!pk && 
        <div className="mib">
          <h5 className="title">Configuración de la Habitación</h5>
          <hr />
          <h5 className="subtitle ml-3">{headerTitle}</h5>
          <Toolbar className="ml-3 mb-3">
            <Item location="before" locateInMenu="never" widget="dxButton" options={buttonOptions(newEdit)} visible={showEdit} disabled={disabled}/>
            <Item location="before" locateInMenu="never" widget="dxButton" options={buttonOptions(newSave)} visible={!showEdit} disabled={disabled}/>
            <Item location="before" locateInMenu="never" widget="dxButton" options={buttonOptions(newCancel)} visible={!showEdit} disabled={disabled}/>
          </Toolbar>
          { !showEdit && 
            <>
              <hr />
              <h5 className="item ml-3">{rowTitle}</h5>
              <Toolbar className="ml-3 mb-3">
                <Item location="before" locateInMenu="never" widget="dxButton" options={buttonOptions(addRow)} visible={!showEdit} disabled={disabled}/>
                <Item location="before" locateInMenu="never" widget="dxButton" options={buttonOptions(difRow)} visible={!showEdit} disabled={disabled}/>
              </Toolbar>
              <h5 className="item ml-3">{colTitle}</h5>
              <Toolbar className="ml-3 mb-3">
                <Item location="before" locateInMenu="never" widget="dxButton" options={buttonOptions(addCol)} visible={!showEdit} disabled={disabled}/>
                <Item location="before" locateInMenu="never" widget="dxButton" options={buttonOptions(difCol)} visible={!showEdit} disabled={disabled}/>
              </Toolbar>
            </>
          }
        </div>
      }
    </>
  );
};

export default injectIntl(HabitacionItemEditorBotonera);



// import React, { useEffect, useState } from "react";
// import { injectIntl } from "react-intl"; 
// import Toolbar, { Item } from "devextreme-react/toolbar";

// import "./style.css";
// import { ItemSectionType } from "../../../../Shared";
// import { isFunction } from "../../../../../../../../../../partials/shared/CommonHelper";

// const HabitacionItemEditorBotonera = ({
//   parent,
//   item,
//   pk,
//   visible = true,
//   toolbar,
//   selectItemInEdit,
//   intl,
// }) => {
//   const buttonOptions = ({ icon, tooltip: hint, disabled = false, onClick }) => ({ icon, hint, disabled, onClick});
//   const [ { text: headerTitle }, edit, hide, save, cancel, { text: rowTitle }, addRow, difRow, { text: colTitle }, addCol, difCol, ] = toolbar;
  
//   const [showEdit, setShowEdit] = useState(item.SectionType !== ItemSectionType.Configurator);
//   const [disabled, setDisabled] = useState(item.SectionType !== ItemSectionType.Configurator);

//   const extendButtonFunctionality = (button, callback = undefined) => ({ ...button, onClick: () => { if (isFunction(button.onClick)) button.onClick(item); if (isFunction(callback)) callback() }, });

//   const performForEdit = () => {
//     setShowEdit(false);
//     selectItemInEdit(parent, { forSelected: { Disabled: false, SectionType: ItemSectionType.Configurator, Habitacion: undefined }, forUnselected: { Disabled: true, SectionType: undefined, Habitacion: undefined } });
//   }
//   const performForHide = () => {
//     selectItemInEdit(parent, { forSelected: { DetailSectionType: undefined, Habitacion: undefined,  } });
//   }
//   const performForSave = () => {
//     setShowEdit(true);
//   }
//   const performForCancel = () => {
//     setShowEdit(true);
//   }

//   const newEdit = extendButtonFunctionality(edit, performForEdit);
//   const newHide = extendButtonFunctionality(hide, performForHide);
//   const newSave = extendButtonFunctionality(save, performForSave);
//   const newCancel = extendButtonFunctionality(cancel, performForCancel);

//   useEffect(() => {
//     if (!item.SectionType) setDisabled(false);
//     else setDisabled(!!!item.DetailSectionType);
//   }, [parent.DetailSectionType]);

//   return (
//     <>
//       {
//         !!visible &&
//         <div className="mib">
//           <h5 className="title">Configuración de la Habitación</h5>
//           <hr />
//           <h5 className="subtitle ml-3">{headerTitle}</h5>
//           <Toolbar className="ml-3 mb-3">
//             <Item location="before" locateInMenu="never" widget="dxButton" options={buttonOptions(newEdit)} visible={showEdit && !!pk} disabled={disabled}/>
//             <Item location="before" locateInMenu="never" widget="dxButton" options={buttonOptions(newHide)} visible={showEdit || !!!pk} disabled={disabled}/>
//             <Item location="before" locateInMenu="never" widget="dxButton" options={buttonOptions(newSave)} visible={!showEdit && !!pk} disabled={disabled}/>
//             <Item location="before" locateInMenu="never" widget="dxButton" options={buttonOptions(newCancel)} visible={!showEdit && !!pk} disabled={disabled}/>
//           </Toolbar>
//           { !showEdit && !!pk && 
//             <>
//               <hr />
//               <h5 className="item ml-3">{rowTitle}</h5>
//               <Toolbar className="ml-3 mb-3">
//                 <Item location="before" locateInMenu="never" widget="dxButton" options={buttonOptions(addRow)} visible={!showEdit && !!pk} disabled={disabled}/>
//                 <Item location="before" locateInMenu="never" widget="dxButton" options={buttonOptions(difRow)} visible={!showEdit && !!pk} disabled={disabled}/>
//               </Toolbar>
//               <h5 className="item ml-3">{colTitle}</h5>
//               <Toolbar className="ml-3 mb-3">
//                 <Item location="before" locateInMenu="never" widget="dxButton" options={buttonOptions(addCol)} visible={!showEdit && !!pk} disabled={disabled}/>
//                 <Item location="before" locateInMenu="never" widget="dxButton" options={buttonOptions(difCol)} visible={!showEdit && !!pk} disabled={disabled}/>
//               </Toolbar>
//             </>
//           }
//         </div>
//       }
//     </>
//   );
// };

// export default injectIntl(HabitacionItemEditorBotonera);
