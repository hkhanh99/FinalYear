import {PayPalButtons, PayPalScriptProvider} from "@paypal/react-paypal-js"


const PaypalButton = ({amount, onSuccess, onError}) => {
    return(<PayPalScriptProvider options={{"client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID,
    }}>

        <PayPalButtons 
        style= {{layout: "vertical"}}
        createOrder={(data, actions) => {
            return actions.order.create ({
                purchase_units: [{amount: {value: parseFloat(amount).toFixed(2)}}]
            })
        }}
        onApprove = {(data,actions) => {
            return actions.order.capture().then(onSuccess)
        }}
        onError={onError}
        />
    </PayPalScriptProvider>)
}
export default PaypalButton
// import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js"

// const PaypalButton = ({ amount, onSuccess, onError }) => {
//     return (
//         <PayPalScriptProvider options={{
//             "client-id": "AW1N3uoywsQpSkEF2cDqDwWl7lcEoAlslMAcD-KjLRyOf3wMekLvzKRMHZTVjGnDSHTWMH3DRCehdWh-"
//         }}>
//             <PayPalButtons 
//                 style={{ layout: "vertical" }}
//                 createOrder={(data, actions) => {
//                     return actions.order.create({
//                         purchase_units: [{ amount: { value: amount } }]
//                     })
//                 }}
//                 onApprove={(data, actions) => {
//                     return actions.order.capture().then((details) => {
//                         if (onSuccess) onSuccess(details);
//                     });
//                 }}
//                 onError={(err) => {
//                     if (onError) onError(err);
//                 }}
//             />
//         </PayPalScriptProvider>
//     )
// }

// export default PaypalButton