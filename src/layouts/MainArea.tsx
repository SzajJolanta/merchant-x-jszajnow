import { Route, Switch } from "wouter";
import ProductsLayout from "./products/ProductsLayout";
import RelayPoolsLayout from "./store/RelayPoolsLayout";
import ShippingOptionsLayout from "./store/ShippingOptionsLayout";
import OrdersLayout from "./orders/OrdersLayout";

const MainArea = () => {
    return (
        <main className='ml-48 p-4'>
            <Switch>
                <Route path="/products" component={ProductsLayout} />
                <Route path="/store" nest>
                    <Route path="/relays" component={RelayPoolsLayout} />
                    <Route path="/shipping" component={ShippingOptionsLayout} />
                </Route>
                <Route path="/orders" component={OrdersLayout} />
            </Switch>
        </main>
    )
}

export default MainArea;