import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { SearchPaymentsDto } from './dto/search-payments.dto';
import { PaymentStatus, PaymentType } from './entities/payment-transaction.entity';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('process')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Process payment for a booking' })
  @ApiResponse({
    status: 201,
    description: 'Payment processed successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiBody({
    type: ProcessPaymentDto,
    examples: {
      creditCard: {
        summary: 'Credit Card Payment',
        value: {
          bookingId: 'booking-uuid',
          paymentMethodType: 'credit_card',
          amount: 500.00,
          currency: 'USD',
          cardDetails: {
            cardNumber: '4111111111111111',
            cardHolderName: 'John Doe',
            expiryMonth: '12',
            expiryYear: '2025',
            cvv: '123',
          },
          billingName: 'John Doe',
          billingEmail: 'john.doe@example.com',
          billingPhone: '+1234567890',
          billingAddress: '123 Main St',
          billingCity: 'New York',
          billingState: 'NY',
          billingPostalCode: '10001',
          billingCountry: 'USA',
        },
      },
      savedMethod: {
        summary: 'Saved Payment Method',
        value: {
          bookingId: 'booking-uuid',
          userId: 'user-uuid',
          paymentMethodId: 'payment-method-uuid',
          paymentMethodType: 'credit_card',
          amount: 500.00,
          currency: 'USD',
        },
      },
    },
  })
  processPayment(@Body() processPaymentDto: ProcessPaymentDto) {
    return this.paymentsService.processPayment(processPaymentDto);
  }

  @Post('refund')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Process refund for a payment transaction' })
  @ApiResponse({
    status: 201,
    description: 'Refund processed successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Payment transaction not found' })
  @ApiBody({
    type: RefundPaymentDto,
    examples: {
      fullRefund: {
        summary: 'Full Refund',
        value: {
          paymentTransactionId: 'transaction-uuid',
          reason: 'Customer cancellation',
        },
      },
      partialRefund: {
        summary: 'Partial Refund',
        value: {
          paymentTransactionId: 'transaction-uuid',
          amount: 250.00,
          reason: 'Partial cancellation',
        },
      },
    },
  })
  processRefund(@Body() refundPaymentDto: RefundPaymentDto) {
    return this.paymentsService.processRefund(refundPaymentDto);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search payment transactions' })
  @ApiResponse({
    status: 200,
    description: 'Search results with pagination',
  })
  @ApiQuery({ name: 'bookingId', required: false, description: 'Booking UUID' })
  @ApiQuery({ name: 'userId', required: false, description: 'User UUID' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: PaymentStatus,
    description: 'Payment status',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: PaymentType,
    description: 'Payment type',
  })
  @ApiQuery({
    name: 'paymentGateway',
    required: false,
    description: 'Payment gateway name',
  })
  @ApiQuery({
    name: 'transactionId',
    required: false,
    description: 'Transaction ID',
  })
  @ApiQuery({
    name: 'dateFrom',
    required: false,
    description: 'Start date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'dateTo',
    required: false,
    description: 'End date (YYYY-MM-DD)',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  search(@Query() searchPaymentsDto: SearchPaymentsDto) {
    return this.paymentsService.search(searchPaymentsDto);
  }

  @Get('transaction/:id')
  @ApiOperation({ summary: 'Get payment transaction by ID' })
  @ApiParam({ name: 'id', description: 'Payment transaction UUID' })
  @ApiResponse({
    status: 200,
    description: 'Payment transaction details',
  })
  @ApiResponse({ status: 404, description: 'Payment transaction not found' })
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Get('transaction-id/:transactionId')
  @ApiOperation({ summary: 'Get payment transaction by transaction ID' })
  @ApiParam({ name: 'transactionId', description: 'Transaction ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment transaction details',
  })
  @ApiResponse({ status: 404, description: 'Payment transaction not found' })
  findByTransactionId(@Param('transactionId') transactionId: string) {
    return this.paymentsService.findByTransactionId(transactionId);
  }

  @Get('invoice/:id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  @ApiParam({ name: 'id', description: 'Invoice UUID' })
  @ApiResponse({ status: 200, description: 'Invoice details' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  getInvoice(@Param('id') id: string) {
    return this.paymentsService.getInvoice(id);
  }

  @Get('invoice-number/:invoiceNumber')
  @ApiOperation({ summary: 'Get invoice by invoice number' })
  @ApiParam({ name: 'invoiceNumber', description: 'Invoice number' })
  @ApiResponse({ status: 200, description: 'Invoice details' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  getInvoiceByNumber(@Param('invoiceNumber') invoiceNumber: string) {
    return this.paymentsService.getInvoiceByNumber(invoiceNumber);
  }

  @Get('receipt/:id')
  @ApiOperation({ summary: 'Get receipt by ID' })
  @ApiParam({ name: 'id', description: 'Receipt UUID' })
  @ApiResponse({ status: 200, description: 'Receipt details' })
  @ApiResponse({ status: 404, description: 'Receipt not found' })
  getReceipt(@Param('id') id: string) {
    return this.paymentsService.getReceipt(id);
  }

  @Get('receipt-number/:receiptNumber')
  @ApiOperation({ summary: 'Get receipt by receipt number' })
  @ApiParam({ name: 'receiptNumber', description: 'Receipt number' })
  @ApiResponse({ status: 200, description: 'Receipt details' })
  @ApiResponse({ status: 404, description: 'Receipt not found' })
  getReceiptByNumber(@Param('receiptNumber') receiptNumber: string) {
    return this.paymentsService.getReceiptByNumber(receiptNumber);
  }

  @Get('booking/:bookingId/invoices')
  @ApiOperation({ summary: 'Get all invoices for a booking' })
  @ApiParam({ name: 'bookingId', description: 'Booking UUID' })
  @ApiResponse({ status: 200, description: 'List of invoices' })
  getInvoicesByBooking(@Param('bookingId') bookingId: string) {
    return this.paymentsService.getInvoicesByBooking(bookingId);
  }

  @Get('booking/:bookingId/receipts')
  @ApiOperation({ summary: 'Get all receipts for a booking' })
  @ApiParam({ name: 'bookingId', description: 'Booking UUID' })
  @ApiResponse({ status: 200, description: 'List of receipts' })
  getReceiptsByBooking(@Param('bookingId') bookingId: string) {
    return this.paymentsService.getReceiptsByBooking(bookingId);
  }
}

