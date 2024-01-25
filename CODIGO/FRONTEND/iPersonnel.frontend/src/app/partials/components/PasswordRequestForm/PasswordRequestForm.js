import React, { useEffect, useRef, useState } from "react";
import { isFunction, isSet, isString } from "../../../../_metronic/utils/utils";
import "./PasswordRequestForm.css";
import $ from 'jquery';
import Constants from "../../../store/config/Constants";
import { makeStyles } from "@material-ui/core/styles";
import { injectIntl } from "react-intl"; //Multi-idioma
// Fuente: https://medium.com/@geeky_writer_/using-react-hooks-to-create-awesome-forms-6f846a4ce57
//Con algunas modificaciones mias!

const useStyles = makeStyles(theme => ({
    hiberBlanco: {
        color: "white",
    },
    hiberAmarillo: {
        color: "#ffbf00",
    },
    hiberIzquierda: {
        marginRight: "5px"
    }
}));


const useCustomForm = (callback) => {
    const [inputs, setInputs] = useState({});


    const handleSubmit = (event) => {
        if (event) event.preventDefault();
        callback({ inputs, event });
    }
    const handleInputChange = (event) => {
        event.persist();
        setInputs(inputs => ({ ...inputs, [event.target.name]: event.target.value }));
    }
    return {
        handleSubmit,
        handleInputChange,
        inputs
    };
}

const PasswordRequestForm = ({
    isOpen = false,
    username = "",
    passwordPlaceholder = 'Contraseña',
    avatarImage = undefined,
    linkMessage = 'AUTH.LABEL.HIBERNACION.START.SESSION',
    errorMessage: usrErrorMessage = "",
    timeoutErrorMessage,
    onSendCredential: usrOnSendCredential,
    onBackLogin: usrOnBackLogin,
    onCleanedErrorMessage,
    intl,
}) => {

    const timeoutRef = useRef();
    const [firstLetterUsername] = useState(isString(username) && username.length > 0 ? username[0].toUpperCase() : undefined);
    const [errorMessage, setErrorMessage] = useState("");
    const clsHiber = useStyles();

    const onSendCredential = () => {
        const { password } = inputs;
        //OBTENER - reCAPTCHA de google.
        window.grecaptcha.ready(() => {
            window.grecaptcha.execute(Constants.CAPTCHA_SECRETKEYSITE, { action: 'submit' }).then(token => {
                //console.log("get token password request form: ", token);
                if (isFunction(usrOnSendCredential)) usrOnSendCredential({ password, token });

            });
        });

    }
    const { inputs, handleInputChange, handleSubmit } = useCustomForm(onSendCredential);
    const onBackLogin = () => isFunction(usrOnBackLogin) ? usrOnBackLogin() : () => { };
    const onSubmit = event => handleSubmit(event);
    const showErrorMessage = () => {
        if (isString(usrErrorMessage) && isSet(usrErrorMessage)) {
            setErrorMessage(usrErrorMessage);
            if (!!timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
                setErrorMessage(undefined);
                if (isFunction(onCleanedErrorMessage)) {
                    onCleanedErrorMessage();
                }

                clearTimeout(timeoutRef.current);
            }, timeoutErrorMessage);
        }
    }

    useEffect(() => {
        return () => {
            if (!!timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = false;
        };
    }, []);

    useEffect(
        () => {
            showErrorMessage();
        }
        , [usrErrorMessage, timeoutErrorMessage]);

    useEffect(() => {
    }, [isOpen]);



    const handleInputChange_ = () => {
        let type = $("input[name=password]")
        if (type.attr("type") == "text") {
            type.attr('type', 'password');
            $('#togglePassword').addClass("fa-eye-slash");
            $('#togglePassword').removeClass("fa-eye");
        } else if (type.attr("type") == "password") {
            type.attr('type', 'text');
            $('#togglePassword').removeClass("fa-eye-slash");
            $('#togglePassword').addClass("fa-eye");
        }
    }

    const isShortLong = (str) => {
        let isString = ""
        if (str.length > 14) {
            isString = str.substring(0, 14) + '...'
        } else {
            isString = str
        }
        return isString;
    }

    return (
        <>
            {
                !!isOpen && !!username &&
                <div className="backdrop">

                    <div className="page page-lock ng-scope">
                        <div className="lock-centered clearfix">
                            <div className="lock-container">
                                <section className="lock-box">
                                    <div className="lock-user ng-binding">
                                        {isShortLong(`${username}`)}
                                    </div>
                                    <div className="lock-img">
                                        {!!!avatarImage && <section><span>{firstLetterUsername}</span></section>}
                                        {!!avatarImage && <img src={avatarImage} alt="image" />}
                                    </div>
                                    <div className="lock-pwd">
                                        <form onSubmit={onSubmit} noValidate>
                                            <div id="show_hide_password" className="form-group alinear_enter_eyee">
                                                <input className="form-control block mt-1 w-full" type="password" name="password" id="password"
                                                    placeholder={passwordPlaceholder} value={inputs.password} onChange={handleInputChange} />

                                                <a href="#" className="alinear_enter_eyee_espacio">
                                                    <i className="far fa-eye-slash" id="togglePassword" style={{ color: '#ffd609' }} onClick={handleInputChange_}></i>
                                                </a>

                                                <a href="#" onClick={handleSubmit} className="btn-submit">
                                                    <i className="fa fa-arrow-right" style={{ color: '#ffd609' }}></i>
                                                </a>

                                            </div>
                                        </form>
                                    </div>
                                </section>
                                <section className="clsHibernacionLogin">
                                    {
                                        (errorMessage !== "") ? (
                                            <div className={clsHiber.hiberBlanco}>
                                                <span className="">{errorMessage}</span>
                                            </div>
                                        ) : (
                                            <div className={clsHiber.hiberBlanco}>
                                                <span className="">{intl.formatMessage({ id: "AUTH.LABEL.HIBERNACION.MESSAGER" })}</span>
                                            </div>
                                        )
                                    }
                                    <div className="">
                                        <a href="#" onClick={onBackLogin} className={clsHiber.hiberAmarillo}>
                                            <i className={`fa fa-user ${clsHiber.hiberIzquierda}`}></i> {intl.formatMessage({ id: linkMessage })}
                                        </a>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>

                </div>
            }
        </>
    );

};
export default injectIntl(PasswordRequestForm);
