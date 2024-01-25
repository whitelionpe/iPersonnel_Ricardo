import React, { useMemo } from "react";
import { toAbsoluteUrl } from "../../../_metronic";

export default function Dashboard() {

    const sectionStyle = {
        width: "30%",
        height: "38%",
        // backgroundImage: `url(${toAbsoluteUrl("/media/bg/FondoiPersonnel.jpeg")})`,
        // backgroundRepeat: 'no-repeat',
        // backgroundSize :'cover',
        // backgroundAttachment: 'local', //'fixed',
        // backgroundPosition: 'left',
        //color: 'red',
        marginTop: "16%",
        marginLeft: "32%",
        marginLeft: 'auto',
        marginRight: 'auto',


    };
    const imgStyle = {
        width: "100%",
        height: "100%",
    }

    return (
        <>
            <section style={sectionStyle}>
                <img src={toAbsoluteUrl("/media/iconsappv02/2personnel_principal.png")} //style={imgStyle} 
                />
            </section>

        </>
    );
}
