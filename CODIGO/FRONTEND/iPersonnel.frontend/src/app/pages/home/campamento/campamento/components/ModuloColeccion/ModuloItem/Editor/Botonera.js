import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl"; 
import Toolbar, { Item } from "devextreme-react/toolbar";

import "./style.css";
import { ItemSectionType } from "../../Shared";
import { isFunction } from "../../../../../../../../partials/shared/CommonHelper";

const ModuloItemEditorBotonera = ({
  item,
  visible = true,
  toolbar,
  selectItemInEdit,
  intl,
}) => {
  const buttonOptions = ({ icon, tooltip: hint, disabled = false, onClick }) => ({ icon, hint, disabled, onClick});
  const [ { text: headerTitle }, edit, save, cancel, { text: rowTitle }, addRow, difRow, { text: colTitle }, addCol, difCol, ] = toolbar;
  
  // const [showEdit, setShowEdit] = useState(item.SectionType !== ItemSectionType.Configurator && item.SectionType !== ItemSectionType.Detail);
  const [showEdit, setShowEdit] = useState(item.SectionType !== ItemSectionType.Configurator && !!!item.DetailSectionType);
  // const [disabled, setDisabled] = useState(item.SectionType !== ItemSectionType.Configurator);
  const [disabled, setDisabled] = useState((!!item.SectionType && item.SectionType !== ItemSectionType.Configurator) || !!item.DetailSectionType);
  // const [inEdit, setInEdit] = useState(item.SectionType !== ItemSectionType.Configurator);

  const extendButtonFunctionality = (button, callback = undefined) => ({ ...button, onClick: () => { if (isFunction(button.onClick)) button.onClick(item); if (isFunction(callback)) callback() }, });

  const performForEdit = () => {
    setShowEdit(false);
    selectItemInEdit(item, { forSelected: { SectionType: ItemSectionType.Configurator }, forUnselected: { Disabled: true, SectionType: undefined } });
  }
  const performForSave = () => {
    setShowEdit(true);
    selectItemInEdit(item, { forSelected: { Disabled: false, SectionType: undefined }, forUnselected: { Disabled: false } });
  }
  const performForCancel = () => {
    setShowEdit(true);
    selectItemInEdit(item, { forSelected: { Disabled: false, SectionType: undefined }, forUnselected: { Disabled: false } });
  }

  const newEdit = extendButtonFunctionality(edit, performForEdit);
  const newSave = extendButtonFunctionality(save, performForSave);
  const newCancel = extendButtonFunctionality(cancel, performForCancel);

  useEffect(() => {
    setDisabled((!!item.SectionType && item.SectionType !== ItemSectionType.Configurator) || !!item.DetailSectionType);
  }, [item.SectionType, item.DetailSectionType]);

  return (
    <>
      {
        !!visible && 
        <div className="mib">
          <h5 className="title">Configuración del Módulo</h5>
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

export default injectIntl(ModuloItemEditorBotonera);
