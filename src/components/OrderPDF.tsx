import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { OrderWithDetails } from '../lib/supabase';
import logoFarmap from '../assets/logo farmap industry.png';

interface OrderPDFProps {
  order: OrderWithDetails;
}

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 20,
    fontSize: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 40,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 20,
    fontSize: 12,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    borderBottom: '1 solid #000',
    paddingBottom: 5,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 15,
  },
  detailItem: {
    width: '45%',
    marginBottom: 8,
  },
  detailLabel: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  table: {
    display: 'table',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
  },
  tableCell: {
    margin: 'auto',
    marginVertical: 5,
    marginHorizontal: 1,
    fontSize: 7,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    padding: 3,
    width: '12%',
    textAlign: 'left',
  },
  tableHeaderCell: {
    margin: 'auto',
    marginVertical: 5,
    marginHorizontal: 1,
    fontSize: 7,
    fontWeight: 'bold',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    padding: 3,
    width: '12%',
    textAlign: 'left',
    backgroundColor: '#f0f0f0',
  },
});

export const OrderPDF: React.FC<OrderPDFProps> = ({ order }) => {
  const isAstuccio = order.print_type === 'astuccio';
  const productsTitle = isAstuccio ? 'Astucci' : 'Etichette';
  const productColumnLabel = isAstuccio ? 'Astuccio' : 'Etichetta';

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>ORDINE DI STAMPA - FARMAP INDUSTRY</Text>
          <View style={styles.orderInfo}>
            <Text>Ordine: {order.order_number}</Text>
            <Text>Data: {new Date(order.created_at).toLocaleDateString('it-IT')}</Text>
          </View>
        </View>

        {/* Order Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dettagli Ordine</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Data Creazione:</Text>
              <Text>{new Date(order.created_at).toLocaleDateString('it-IT')}</Text>
            </View>
          </View>
        </View>

        {/* Products Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{productsTitle}</Text>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableHeaderCell}>{productColumnLabel}</Text>
              <Text style={styles.tableHeaderCell}>Cliente</Text>
              <Text style={styles.tableHeaderCell}>EAN</Text>
              <Text style={styles.tableHeaderCell}>Misura</Text>
              <Text style={styles.tableHeaderCell}>Lotto</Text>
              <Text style={styles.tableHeaderCell}>Scadenza</Text>
              <Text style={styles.tableHeaderCell}>Produzione</Text>
              <Text style={styles.tableHeaderCell}>Qtà</Text>
            </View>
            
            {/* Table Rows */}
            {order.order_details.map((detail, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{detail.product_name || 'N/A'}</Text>
                <Text style={styles.tableCell}>{detail.client_name || 'N/A'}</Text>
                <Text style={styles.tableCell}>{detail.ean_code || 'N/A'}</Text>
                <Text style={styles.tableCell}>
                  {detail.measurements || 'N/A'}
                  {(detail.fronte_retro || detail.sagomata) && (
                    <Text style={{ fontSize: 6, color: '#666' }}>
                      {'\n'}{detail.fronte_retro ? 'Fronte retro' : ''}
                      {detail.fronte_retro && detail.sagomata ? ', ' : ''}
                      {detail.sagomata ? 'Sagomata' : ''}
                    </Text>
                  )}
                </Text>
                <Text style={styles.tableCell}>{detail.lot_number || 'N/A'}</Text>
                <Text style={styles.tableCell}>
                  {detail.expiry_date ? new Date(detail.expiry_date).toLocaleDateString('it-IT') : 'N/A'}
                </Text>
                <Text style={styles.tableCell}>
                  {detail.production_date ? new Date(detail.production_date).toLocaleDateString('it-IT') : 'N/A'}
                </Text>
                <Text style={styles.tableCell}>{detail.quantity || 'N/A'}</Text>
              </View>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
};
