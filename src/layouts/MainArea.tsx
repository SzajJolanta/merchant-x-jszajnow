import { Route, Switch } from "wouter";
import ProductsLayout from "./products/ProductsLayout";
import RelayPoolsLayout from "./store/RelayPoolsLayout";
import ShippingOptionsLayout from "./store/ShippingOptionsLayout";
import ProductEditorLayout from "./products/ProductEditorLayout";
import StoreProfileLayout from "./store/StoreProfileLayout";
import CurrencySettingsLayout from "./store/CurrencySettingsLayout";
import CheckoutSettingsLayout from "./store/CheckoutSettingsLayout";
import CompletedOrdersLayout from "./orders/CompletedOrdersLayout";
import PendingOrdersLayout from "./orders/PendingOrdersLayout";
import FailedOrdersLayout from "./orders/FailedOrdersLayout";
import CancelledOrdersLayout from "./orders/CancelledOrdersLayout";
import CreateNewOrderLayout from "./orders/CreateNewOrderLayout";

const MainArea = () => {
    return (
        <main className='ml-48 p-4'>
            <Switch>
                <Route path="/store" nest>
                    <Route path="/" component={StoreProfileLayout} />
                    <Route path="/relays" component={RelayPoolsLayout} />
                    <Route path="/shipping" component={ShippingOptionsLayout} />
                    <Route path="/checkout" component={CheckoutSettingsLayout} />
                </Route>
                <Route path="/products" nest>
                    <Route path="/" component={ProductsLayout} />
                    <Route path="/create" component={ProductEditorLayout} />
                </Route>
                <Route path="/orders" nest>
                    <Route path="/completed" component={CompletedOrdersLayout} />
                    <Route path="/pending" component={PendingOrdersLayout} />
                    <Route path="/failed" component={FailedOrdersLayout} />
                    <Route path="/cancelled" component={CancelledOrdersLayout} />
                    <Route path="/create" component={CreateNewOrderLayout} />
                </Route>
            </Switch>
        </main>
    )
}

export default MainArea;