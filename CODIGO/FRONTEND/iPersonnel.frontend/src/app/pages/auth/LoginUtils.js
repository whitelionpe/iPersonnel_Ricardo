export const crear_menu = (menus) => {
    let array_menu = [];
    let a_principales = menus.filter(x => x.IdMenuPadre == "");
    let obj_menu = { header: { self: {}, items: [] }, aside: { self: {}, items: [], } };
    let lista_accesos = [];
    let item_default = { title: "INICIO", root: true, alignment: "left", page: "dashboard", translate: "MENU.DASHBOARD", Tag: "CONFIG.MENU.INICIO" };


    for (let i = 0; i < a_principales.length; i++) {
        let item = a_principales[i];
        array_menu.push({
            title: item.Modulo,
            root: true,
            alignment: "left",
            toggle: "click",
            info: item,
            Tag: item.Tag,
            type: "classic"
        });

        let a_secundarios = menus.filter(x => x.IdMenuPadre == item.IdMenu).sort((x, y) => x.Orden - y.Orden);

        if (a_secundarios.length > 0) {
            array_menu[i].submenu = [];
            for (let j = 0; j < a_secundarios.length; j++) {
                let subitem = a_secundarios[j];
                let detalle = create_array_hijo(subitem, menus, 1);
                array_menu[i].submenu.push(detalle);
            }
        }
    }


    if (array_menu.length > 0) {
        obj_menu.header.items = array_menu;
        //Asignar configuración al menú. 
        lista_accesos = menus.filter(x => x.Ruta != "").map(x => ({
            IdModulo: x.IdModulo,
            IdAplicacion: x.IdAplicacion,
            IdMenu: x.IdMenu,
            Ruta: x.Ruta,
            Tag: x.Tag
        }));


    }
    obj_menu.header.items.unshift(item_default);

    return { obj_menu, lista_accesos }
}

export const create_array_hijo = (item, array_menu, nivel) => {
    let a_secundarios = array_menu.filter(x => x.IdMenuPadre == item.IdMenu).sort((x, y) => x.Orden - y.Orden);
    let submenuItem = {};
    submenuItem.title = item.Modulo;
    submenuItem.info = item;
    submenuItem.Tag = item.Tag;
    submenuItem.Nivel = nivel;
    submenuItem.alignment = nivel > 2 ? "left" : "right";

    if (item.Ruta != '') {
        submenuItem.page = item.Ruta;
    }

    if (a_secundarios.length > 0) {
        submenuItem.bullet = "dot";
        submenuItem.icon = "flaticon2-gear";
        submenuItem.submenu = [];
        // submenuItem.type = "mega"; //ADD JDL-Jimmy->2023-05-24
        // submenuItem.width="90px";

        for (let j = 0; j < a_secundarios.length; j++) {
            let item = create_array_hijo(a_secundarios[j], array_menu, nivel + 1)
            submenuItem.submenu.push(item);
        }
    } else {
        submenuItem.bullet = "dot";
        submenuItem.icon = "flaticon2-expand";
        // submenuItem.type = "mega"; //ADD JDL->2023-05-24
        // submenuItem.width="90px";
    }
    return submenuItem;
}