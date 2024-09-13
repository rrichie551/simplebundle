import Highcharts from 'highcharts';
import { json } from "@remix-run/node";
import { useLoaderData, useNavigation } from '@remix-run/react';
import { useEffect } from 'react';
import { authenticate } from '../shopify.server';
import prisma from '../db.server';
import {
  Page,
  Layout,
  BlockStack,
  Spinner
} from "@shopify/polaris";
import { AnalyticsOverview } from '../components/AnalyticsOverview';
import { fetchShopInfo } from '../fetchShopInfo.server';

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const analytics = await prisma.analytics.findFirst({
    where: { userId: session.id }
  });
  const data = await fetchShopInfo(request);
  const currency =  data.data.shop.currencyCode

  return json({
    analytics: analytics || { revenue: '0', orders: '0', currency: '$' }, // Default to 0 revenue and a default currency if no data
    currency: currency
    
  });
};

export default function Analytics() {
  const { analytics, currency } = useLoaderData();
  const navigation = useNavigation();
  const totalRevenue = parseFloat(analytics.revenue);
  const totalOrders =  parseFloat(analytics.orders);// Set totalOrders to 0 if there's no revenue
  const averageOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;
  const finalOrderValue = averageOrderValue.toFixed(2);

  useEffect(() => {
    // Donut chart for Revenue and Orders distribution
    Highcharts.chart('revenue-orders-chart', {
        chart: {
            type: 'pie'
        },
        title: {
            text: 'Revenue vs Orders Distribution'
        },
        plotOptions: {
            pie: {
                innerSize: '50%',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %'
                }
            }
        },
        series: [{
            name: 'Metrics',
            data: [
                { name: 'Revenue', y: totalRevenue },
                { name: 'Orders', y: totalOrders }
            ]
        }],
        tooltip: {
            pointFormat: '{series.name}: <b>{point.y}</b>'
        }
    });

    // Donut chart for AOV
    Highcharts.chart('aov-chart', {
        chart: {
            type: 'pie'
        },
        title: {
            text: 'Average Order Value (AOV)'
        },
        plotOptions: {
            pie: {
                innerSize: '50%',
                dataLabels: {
                    enabled: true,
                    format: `<b>{point.name}</b>: {point.y:.2f} ${currency}`
                }
            }
        },
        series: [{
            name: 'AOV',
            data: [
                { name: 'AOV', y: averageOrderValue }
            ]
        }],
        tooltip: {
            pointFormat: `{series.name}: <b>{point.y:.2f} ${currency}</b>`
        }
    });

}, [totalRevenue, totalOrders, averageOrderValue,currency]);

  return (
    <>
      <Page fullWidth>
      {navigation.state === "loading" ? ( 
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Spinner accessibilityLabel="Loading" size="large" />
      </div>
       ):
     (
        <BlockStack gap="800">
          <Layout>
            <Layout.Section>
              <AnalyticsOverview 
                currency={currency}
                totalBundles={totalRevenue}
                activeBundles={totalOrders}
                draftBundles={finalOrderValue}
              />
            </Layout.Section>
          </Layout>
          <Layout>
            <Layout.Section>
              <div style={{display:'flex', gap:'20px'}} className="charts-cont">
                <div id="revenue-orders-chart" style={{ width: "100%", height: "400px", marginBottom: '20px' }}></div>
                <div id="aov-chart" style={{ width: "100%", height: "400px" }}></div>
              </div>
            </Layout.Section>
          </Layout>
          <div style={{ height: '60px' }} aria-hidden="true" /> {/* Spacer */}
        </BlockStack>
     )}
      </Page>
    </>
  );
}
