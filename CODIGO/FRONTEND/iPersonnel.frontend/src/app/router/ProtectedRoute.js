import React, { useEffect, useState } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useSelector } from "react-redux";
import { serviceUsuarioPerfil } from '../api/seguridad/usuarioPerfil.api';
import { ErrorPage1 } from "../pages/errors/ErrorPage1";
import { ErrorPage6 } from "../pages/errors/ErrorPage6";
import { handleErrorMessages, handleWarningMessages } from '../store/ducks/notify-messages';


export const ProtectedRoute = ({ component: Component, ...rest }) => {

    const menu_opciones = useSelector(state => state.perfil.menu_opciones);
    const usuario = useSelector(state => state.auth.user);
    const perfilActual = useSelector(state => state.perfil.perfilActual);
    const pagina = rest.path.toUpperCase();

    const [opciones, setOpciones] = useState({}); 
    const [visible, setVisible] = useState(false);
    const [acceso, setAcceso] = useState(0);

    const cargarDatosAutorizacion = async () => {
        //Default: 
        setVisible(false);
        setAcceso(0);

        let IdUsuario = usuario.username;
        let { IdCliente, IdDivision, IdPerfil, IdPais } = perfilActual;

        let itemsMenu = menu_opciones.filter(x => x.Ruta.toUpperCase() === pagina.substring(1, pagina.length)) || [];

        //console.log("PROTECTED_ROUTER:::", itemsMenu);

        if (itemsMenu.length > 0) {
            //console.log("PROTECTED_ROUTER::: Existen elementos");
            let { IdAplicacion, IdMenu, IdModulo, Ruta } = itemsMenu[0];
            let param = { IdCliente, IdPerfil, IdUsuario, IdModulo, IdAplicacion, IdMenu, Ruta };
            await serviceUsuarioPerfil.configuracionByUsuario(param)
                .then(res => {
                    //console.log("configuracionByUsuario::: Response:-->", res);
                    if (res === "") {
                        setAcceso(0);
                        setVisible(true);
                    } else {
                        let { acceso, menu_objeto, proteccion_datos, menu_datos } = res;
                        menu_datos = menu_datos.map(x => ({
                            Campo: x.Campo, Descripcion: x.Descripcion, Obligatorio: x.Obligatorio, Modificable: x.Modificable
                        }));

                        setOpciones({
                            info: itemsMenu[0],
                            objetos: menu_objeto,
                            datos: menu_datos,
                            protecion_datos: proteccion_datos,
                        });
                        setAcceso(acceso);
                        setVisible(true);
                    }
                }).catch(err => {
                    //console.log("err>",err);
                    //console.log("err.response>>>>",err.response);
                    let dataError = err.response;
                    if (dataError) {
                        const { status } = dataError;
                        //console.log("status",status);
                        if (status === 400) handleErrorMessages("Aviso", err);
                    }
                    // let dataError = err.response;
                    //   if(dataError.data) handleWarningMessages("Aviso",dataError.data );          

                    setAcceso(0);
                    setVisible(true);
                });

        } else {
            //console.log("PROTECTED_ROUTER:::-else");
            setAcceso(404);
            setVisible(true);
        }
    }

    /*useEffect(() => {
        cargarDatosAutorizacion();
    }, []);*/

    useEffect(() => {
        cargarDatosAutorizacion();
    }, [pagina]);


    if (!visible) {
        return null;
    }

    if (visible) {
        if (acceso === 1) {
            return (
                <Route
                    {...rest}
                    render={props => {
                        return <Component {...props} dataMenu={opciones} />
                    }}
                />
            );
        } else if (acceso === 0) {
            //Pagina Sin acceso. 
            return <Route
                {...rest}
                render={props => {
                    return <ErrorPage6 {...props} />
                }}
            />
        } else if (acceso === 404) {
            //Página incorrecta 

            return <Route
                {...rest}
                render={props => {
                    return <ErrorPage1 {...props} />
                }}
            />
        }
    }

}
