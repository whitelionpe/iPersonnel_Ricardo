import React, { useEffect, useState, useRef } from "react";
import { injectIntl } from "react-intl";
import { MultiView } from "devextreme-react";

import "./style.css";
import { ModuloItemEditorDataEditor, ModuloItemEditorDataInfo, ModuloItemEditorDataMessage } from ".";
import { ItemDataViewType } from "../../../";
import { ItemSectionType } from "../../../Shared";

const ModuloItemEditorData = ({
  item,
  selectItemInEdit,
  intl,
}) => {
  const dataSource = [
    { type: ItemDataViewType.Info },
    { type: ItemDataViewType.Editor },
    { type: ItemDataViewType.Message },
  ];
  
  const timer = useRef(false);

  const [selectedIndex, setSelectedIndex]= useState( item.SectionType === ItemSectionType.Data ? 1 : 0);
  const [dataEditor]= useState({ ...item });
  const changeView = index => {
		setSelectedIndex(index);
  }

  const onSelectionChanged = args => {
    if (args.name == 'selectedIndex') {
      changeView(args.value);
    }
  }

  const mostrarEditor = () => {
    selectItemInEdit(item, { forSelected: { SectionType: ItemSectionType.Data }, forUnselected: { Disabled: true } });
  }
  const mostrarInfo = () => {};

  const cancelar = () => {
    selectItemInEdit(item, { forSelected: { SectionType: undefined }, forUnselected:  { Disabled: false } });
  }

  const grabar = () => {
    changeView(2);
  }

  const viewItemComponent = ({data: { type }}) => {
    switch(type) {
      case ItemDataViewType.Info:
        return (<ModuloItemEditorDataInfo item={item} mostrarEditor={mostrarEditor} />);
        case ItemDataViewType.Editor:
          return (<ModuloItemEditorDataEditor dataEditor={dataEditor} grabar={grabar} cancelar={cancelar} />);
        case ItemDataViewType.Message:
          return (<ModuloItemEditorDataMessage item={item} viewIndex={selectedIndex} mostrarInfo={mostrarInfo} />);
      default:
        return undefined;
    }
  }

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = false;
    }
  }, []);

  useEffect(() => {
    setSelectedIndex(item.SectionType === ItemSectionType.Data ? 1 : 0)
  }, [item.SectionType]);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);

    if (selectedIndex === 2) {
      timer.current = setTimeout(() => {
        if (timer.current) clearTimeout(timer.current);
        timer.current = false;
        selectItemInEdit(item, { forSelected: { SectionType: undefined }, forUnselected: { Disabled: false } });
      }, 1000);
    }
  }, [selectedIndex]);
  
  return (
    <MultiView
      height={250}
      dataSource={dataSource}
      selectedIndex={selectedIndex}
      onOptionChanged={onSelectionChanged}
      itemComponent={viewItemComponent}
      animationEnabled={true}
      swipeEnabled={false}
      loop={false}
    />
  );
};

export default injectIntl(ModuloItemEditorData);
