import React from 'react';
import './ReservaLeyenda.css';
import './ReservaListPage.css';
const ReservaLeyenda = () => {
    return (
        <div className="row">
            <div className="div_leyenda_reserva">
                <p>Leyenda:</p>
                <div className="div_leyenda_item_reserva" ><span className="item_reservado">R</span>Reservada</div>
                <div className="div_leyenda_item_reserva" ><span className="item_ocupado">O</span>Ocupada</div>
                <div className="div_leyenda_item_reserva" ><span className="item_checkout">F</span>Finalizada</div>
                <div className="div_leyenda_item_reserva" ><span className="item_exclusiva">EX</span>Exclusiva</div>
                <div className="div_leyenda_item_reserva" ><span className="item_exclusiva"> &nbsp;&nbsp;</span>Libre</div>
            </div>
        </div>

    );
};

export default ReservaLeyenda;