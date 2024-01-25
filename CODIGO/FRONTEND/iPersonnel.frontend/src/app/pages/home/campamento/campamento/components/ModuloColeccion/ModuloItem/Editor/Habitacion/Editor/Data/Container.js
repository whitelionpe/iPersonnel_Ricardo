import React, { useEffect, useState, useRef } from "react";
import { injectIntl } from "react-intl";
import { MultiView } from "devextreme-react";

import "./style.css";
import { HabitacionItemEditorDataEditor, HabitacionItemEditorDataInfo, HabitacionItemEditorDataMessage } from ".";
import { ItemSectionType, ItemDataViewType } from "../../../../../";

const HabitacionItemEditorData = ({
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
    selectItemInEdit(item, ItemSectionType.Data);
  }
  const mostrarInfo = () => {};

  const cancelar = () => {
    selectItemInEdit(undefined);
  }

  const grabar = () => {
    changeView(2);
  }

  const viewItemComponent = ({data: { type }}) => {
    switch(type) {
      case ItemDataViewType.Info:
        return (<HabitacionItemEditorDataInfo item={item} mostrarEditor={mostrarEditor} />);
        case ItemDataViewType.Editor:
          return (<HabitacionItemEditorDataEditor dataEditor={dataEditor} grabar={grabar} cancelar={cancelar} />);
        case ItemDataViewType.Message:
          return (<HabitacionItemEditorDataMessage item={item} viewIndex={selectedIndex} mostrarInfo={mostrarInfo} />);
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
    // if (item.SectionType === ItemSectionType.Data) console.log('item.SectionType === ItemSectionType.Data', item.SectionType);
    setSelectedIndex(item.SectionType === ItemSectionType.Data ? 1 : 0)
  }, [item.SectionType]);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);

    if (selectedIndex === 2) {
      timer.current = setTimeout(() => {
        if (timer.current) clearTimeout(timer.current);
        timer.current = false;
        selectItemInEdit(undefined);
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

export default injectIntl(HabitacionItemEditorData);
