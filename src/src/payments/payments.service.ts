import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import {
  PaymentTransaction,
  PaymentStatus,
  PaymentType,
} from './entities/payment-transaction.entity';
import { Invoice, InvoiceStatus } from './entities/invoice.entity';
import { Receipt } from './entities/receipt.entity';
import { Booking, BookingStatus } from '../bookings/entities/booking.entity';
import { User } from '../users/entities/user.entity';
import { PaymentMethod } from '../users/entities/payment-method.entity';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { SearchPaymentsDto } from './dto/search-payments.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(PaymentTransaction)
    private paymentTransactionRepository: Repository<PaymentTransaction>,
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(Receipt)
    private receiptRepository: Repository<Receipt>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(PaymentMethod)
    private paymentMethodRepository: Repository<PaymentMethod>,
  ) {}

  /**
   * Generate unique transaction ID
   */
  private generateTransactionId(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `TXN${timestamp}${random}`;
  }

  /**
   * Generate unique invoice number
   */
  private generateInvoiceNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');
    return `INV-${year}-${random}`;
  }

  /**
   * Generate unique receipt number
   */
  private generateReceiptNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');
    return `RCP-${year}-${random}`;
  }

  /**
   * Process payment for a booking
   * 
   * This method handles the complete payment processing flow:
   * 1. Validates booking and payment amount
   * 2. Processes payment through payment gateway (mock implementation)
   * 3. Creates payment transaction record
   * 4. Updates booking status to CONFIRMED
   * 5. Generates invoice and receipt
   * 
   * @param processPaymentDto - Payment processing data
   * @returns Payment transaction with invoice and receipt
   */
  async processPayment(
    processPaymentDto: ProcessPaymentDto,
  ): Promise<{
    transaction: PaymentTransaction;
    invoice: Invoice;
    receipt: Receipt;
    booking: Booking;
  }> {
    // Validate booking exists
    const booking = await this.bookingRepository.findOne({
      where: { id: processPaymentDto.bookingId },
      relations: ['flight', 'passengers'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Validate booking is in PENDING status
    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException(
        `Cannot process payment for booking with status: ${booking.status}`,
      );
    }

    // Validate payment amount matches booking amount
    if (processPaymentDto.amount !== booking.totalAmount) {
      throw new BadRequestException(
        `Payment amount (${processPaymentDto.amount}) does not match booking amount (${booking.totalAmount})`,
      );
    }

    // Validate user if provided
    if (processPaymentDto.userId) {
      const user = await this.userRepository.findOne({
        where: { id: processPaymentDto.userId },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
    }

    // Validate payment method if using saved method
    let paymentMethod: PaymentMethod | null = null;
    if (processPaymentDto.paymentMethodId) {
      paymentMethod = await this.paymentMethodRepository.findOne({
        where: { id: processPaymentDto.paymentMethodId },
      });
      if (!paymentMethod) {
        throw new NotFoundException('Payment method not found');
      }
    }

    // Generate transaction ID
    let transactionId: string;
    let attempts = 0;
    do {
      transactionId = this.generateTransactionId();
      attempts++;
      if (attempts > 10) {
        throw new ConflictException('Failed to generate unique transaction ID');
      }
    } while (
      await this.paymentTransactionRepository.findOne({
        where: { transactionId },
      })
    );

    // Mock payment gateway processing
    // In production, this would integrate with actual payment gateway (Stripe, PayPal, etc.)
    const gatewayResponse = await this.mockPaymentGatewayProcess(
      processPaymentDto,
    );

    // Create payment transaction
    const transaction = this.paymentTransactionRepository.create({
      transactionId,
      bookingId: booking.id,
      userId: processPaymentDto.userId || booking.userId || null,
      paymentMethodId: processPaymentDto.paymentMethodId || null,
      status:
        gatewayResponse.success === true
          ? PaymentStatus.COMPLETED
          : PaymentStatus.FAILED,
      type: PaymentType.BOOKING_PAYMENT,
      amount: processPaymentDto.amount,
      currency: processPaymentDto.currency || booking.currency || 'USD',
      paymentGateway: processPaymentDto.paymentGateway || 'mock_gateway',
      gatewayTransactionId: gatewayResponse.transactionId || null,
      gatewayResponse: JSON.stringify(gatewayResponse),
      failureReason: gatewayResponse.success === false ? gatewayResponse.message : null,
      processedAt: gatewayResponse.success === true ? new Date() : null,
      paymentMethodType: processPaymentDto.paymentMethodType,
      cardLastFour: this.extractLastFourDigits(processPaymentDto),
      cardBrand: this.extractCardBrand(processPaymentDto),
      notes: processPaymentDto.notes,
    });

    const savedTransaction = await this.paymentTransactionRepository.save(
      transaction,
    );

    // If payment failed, return transaction without updating booking
    if (savedTransaction.status === PaymentStatus.FAILED) {
      return {
        transaction: savedTransaction,
        invoice: null,
        receipt: null,
        booking,
      };
    }

    // Update booking status to CONFIRMED
    booking.status = BookingStatus.CONFIRMED;
    booking.confirmationDate = new Date();
    await this.bookingRepository.save(booking);

    // Generate invoice
    const invoice = await this.generateInvoice(booking, savedTransaction, processPaymentDto);

    // Generate receipt
    const receipt = await this.generateReceipt(booking, savedTransaction, invoice);

    return {
      transaction: savedTransaction,
      invoice,
      receipt,
      booking,
    };
  }

  /**
   * Mock payment gateway processing
   * In production, this would integrate with actual payment gateway
   */
  private async mockPaymentGatewayProcess(
    processPaymentDto: ProcessPaymentDto,
  ): Promise<{
    success: boolean;
    transactionId?: string;
    message?: string;
  }> {
    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock validation - simulate 5% failure rate
    const random = Math.random();
    if (random < 0.05) {
      return {
        success: false,
        message: 'Payment declined by bank',
      };
    }

    // Generate mock gateway transaction ID
    const gatewayTransactionId = `GW-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    return {
      success: true,
      transactionId: gatewayTransactionId,
      message: 'Payment processed successfully',
    };
  }

  /**
   * Extract last 4 digits from card number
   */
  private extractLastFourDigits(processPaymentDto: ProcessPaymentDto): string | null {
    if (processPaymentDto.cardDetails?.cardNumber) {
      const cardNumber = processPaymentDto.cardDetails.cardNumber.replace(/\s/g, '');
      return cardNumber.slice(-4);
    }
    return null;
  }

  /**
   * Extract card brand from card number
   */
  private extractCardBrand(processPaymentDto: ProcessPaymentDto): string | null {
    if (processPaymentDto.cardDetails?.cardNumber) {
      const cardNumber = processPaymentDto.cardDetails.cardNumber.replace(/\s/g, '');
      if (cardNumber.startsWith('4')) return 'Visa';
      if (cardNumber.startsWith('5')) return 'Mastercard';
      if (cardNumber.startsWith('3')) return 'American Express';
      if (cardNumber.startsWith('6')) return 'Discover';
    }
    return null;
  }

  /**
   * Generate invoice for a booking
   */
  async generateInvoice(
    booking: Booking,
    transaction: PaymentTransaction,
    processPaymentDto?: ProcessPaymentDto,
  ): Promise<Invoice> {
    // Check if invoice already exists
    const existingInvoice = await this.invoiceRepository.findOne({
      where: { bookingId: booking.id },
    });

    if (existingInvoice) {
      return existingInvoice;
    }

    // Generate unique invoice number
    let invoiceNumber: string;
    let attempts = 0;
    do {
      invoiceNumber = this.generateInvoiceNumber();
      attempts++;
      if (attempts > 10) {
        throw new ConflictException('Failed to generate unique invoice number');
      }
    } while (
      await this.invoiceRepository.findOne({
        where: { invoiceNumber },
      })
    );

    // Calculate amounts (simplified - in production, get from pricing service)
    const subtotal = booking.totalAmount;
    const taxes = subtotal * 0.1; // 10% tax (example)
    const fees = subtotal * 0.05; // 5% fees (example)
    const discount = 0; // No discount by default
    const totalAmount = subtotal + taxes + fees - discount;

    const invoice = this.invoiceRepository.create({
      invoiceNumber,
      bookingId: booking.id,
      userId: booking.userId || transaction.userId || null,
      status: InvoiceStatus.PAID,
      invoiceDate: new Date(),
      paidDate: transaction.processedAt || new Date(),
      subtotal,
      taxes,
      fees,
      discount,
      totalAmount,
      currency: booking.currency || 'USD',
      billingName: processPaymentDto?.billingName || null,
      billingEmail: processPaymentDto?.billingEmail || null,
      billingPhone: processPaymentDto?.billingPhone || null,
      billingAddress: processPaymentDto?.billingAddress || null,
      billingCity: processPaymentDto?.billingCity || null,
      billingState: processPaymentDto?.billingState || null,
      billingPostalCode: processPaymentDto?.billingPostalCode || null,
      billingCountry: processPaymentDto?.billingCountry || null,
      taxBreakdown: JSON.stringify([
        { name: 'Service Tax', rate: 10, amount: taxes },
        { name: 'Processing Fee', rate: 5, amount: fees },
      ]),
      notes: processPaymentDto?.notes || null,
    });

    return await this.invoiceRepository.save(invoice);
  }

  /**
   * Generate receipt for a payment
   */
  async generateReceipt(
    booking: Booking,
    transaction: PaymentTransaction,
    invoice: Invoice,
  ): Promise<Receipt> {
    // Check if receipt already exists
    const existingReceipt = await this.receiptRepository.findOne({
      where: { paymentTransactionId: transaction.id },
    });

    if (existingReceipt) {
      return existingReceipt;
    }

    // Generate unique receipt number
    let receiptNumber: string;
    let attempts = 0;
    do {
      receiptNumber = this.generateReceiptNumber();
      attempts++;
      if (attempts > 10) {
        throw new ConflictException('Failed to generate unique receipt number');
      }
    } while (
      await this.receiptRepository.findOne({
        where: { receiptNumber },
      })
    );

    const receipt = this.receiptRepository.create({
      receiptNumber,
      bookingId: booking.id,
      userId: booking.userId || transaction.userId || null,
      paymentTransactionId: transaction.id,
      invoiceId: invoice.id,
      receiptDate: new Date(),
      amount: transaction.amount,
      currency: transaction.currency,
      paymentMethod: this.getPaymentMethodDisplayName(transaction),
      paymentReference: transaction.gatewayTransactionId || transaction.transactionId,
      subtotal: invoice.subtotal,
      taxes: invoice.taxes,
      fees: invoice.fees,
      discount: invoice.discount,
      taxBreakdown: invoice.taxBreakdown,
      notes: transaction.notes,
    });

    return await this.receiptRepository.save(receipt);
  }

  /**
   * Get payment method display name
   */
  private getPaymentMethodDisplayName(transaction: PaymentTransaction): string {
    if (transaction.cardBrand) {
      return `${transaction.cardBrand} ending in ${transaction.cardLastFour}`;
    }
    if (transaction.paymentMethodType === 'digital_wallet') {
      return 'Digital Wallet';
    }
    if (transaction.paymentMethodType === 'upi') {
      return 'UPI';
    }
    if (transaction.paymentMethodType === 'net_banking') {
      return 'Net Banking';
    }
    return 'Payment';
  }

  /**
   * Process refund for a payment transaction
   */
  async processRefund(refundPaymentDto: RefundPaymentDto): Promise<{
    transaction: PaymentTransaction;
    refundTransaction: PaymentTransaction;
  }> {
    // Find original payment transaction
    const originalTransaction = await this.paymentTransactionRepository.findOne({
      where: { id: refundPaymentDto.paymentTransactionId },
      relations: ['booking'],
    });

    if (!originalTransaction) {
      throw new NotFoundException('Payment transaction not found');
    }

    // Validate transaction can be refunded
    if (originalTransaction.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException(
        `Cannot refund transaction with status: ${originalTransaction.status}`,
      );
    }

    // Determine refund amount
    const refundAmount =
      refundPaymentDto.amount || originalTransaction.amount;

    // Validate refund amount
    if (refundAmount > originalTransaction.amount - originalTransaction.refundedAmount) {
      throw new BadRequestException(
        `Refund amount (${refundAmount}) exceeds available amount (${originalTransaction.amount - originalTransaction.refundedAmount})`,
      );
    }

    // Generate refund transaction ID
    let refundTransactionId: string;
    let attempts = 0;
    do {
      refundTransactionId = `REF-${this.generateTransactionId()}`;
      attempts++;
      if (attempts > 10) {
        throw new ConflictException('Failed to generate unique refund transaction ID');
      }
    } while (
      await this.paymentTransactionRepository.findOne({
        where: { transactionId: refundTransactionId },
      })
    );

    // Mock refund processing
    const refundResponse = await this.mockRefundProcess(
      originalTransaction,
      refundAmount,
    );

    // Create refund transaction
    const refundTransaction = this.paymentTransactionRepository.create({
      transactionId: refundTransactionId,
      bookingId: originalTransaction.bookingId,
      userId: originalTransaction.userId,
      paymentMethodId: originalTransaction.paymentMethodId,
      status:
        refundResponse.success === true
          ? PaymentStatus.COMPLETED
          : PaymentStatus.FAILED,
      type:
        refundAmount === originalTransaction.amount
          ? PaymentType.REFUND
          : PaymentType.PARTIAL_REFUND,
      amount: refundAmount,
      currency: originalTransaction.currency,
      paymentGateway: originalTransaction.paymentGateway,
      gatewayTransactionId: refundResponse.transactionId || null,
      gatewayResponse: JSON.stringify(refundResponse),
      failureReason: refundResponse.success === false ? refundResponse.message : null,
      processedAt: refundResponse.success === true ? new Date() : null,
      refundReason: refundPaymentDto.reason,
      notes: refundPaymentDto.notes,
    });

    const savedRefundTransaction = await this.paymentTransactionRepository.save(
      refundTransaction,
    );

    // Update original transaction
    originalTransaction.refundedAmount += refundAmount;
    if (originalTransaction.refundedAmount >= originalTransaction.amount) {
      originalTransaction.status = PaymentStatus.REFUNDED;
    } else {
      originalTransaction.status = PaymentStatus.PARTIALLY_REFUNDED;
    }
    originalTransaction.refundedAt = new Date();
    await this.paymentTransactionRepository.save(originalTransaction);

    // Update booking status if full refund
    if (refundAmount === originalTransaction.amount) {
      const booking = await this.bookingRepository.findOne({
        where: { id: originalTransaction.bookingId },
      });
      if (booking) {
        booking.status = BookingStatus.CANCELLED;
        booking.cancellationDate = new Date();
        booking.cancellationReason = refundPaymentDto.reason || 'Refund processed';
        await this.bookingRepository.save(booking);
      }
    }

    return {
      transaction: originalTransaction,
      refundTransaction: savedRefundTransaction,
    };
  }

  /**
   * Mock refund processing
   */
  private async mockRefundProcess(
    originalTransaction: PaymentTransaction,
    refundAmount: number,
  ): Promise<{
    success: boolean;
    transactionId?: string;
    message?: string;
  }> {
    // Simulate refund processing delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock validation - simulate 2% failure rate
    const random = Math.random();
    if (random < 0.02) {
      return {
        success: false,
        message: 'Refund processing failed',
      };
    }

    const refundTransactionId = `REF-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    return {
      success: true,
      transactionId: refundTransactionId,
      message: 'Refund processed successfully',
    };
  }

  /**
   * Get payment transaction by ID
   */
  async findOne(id: string): Promise<PaymentTransaction> {
    const transaction = await this.paymentTransactionRepository.findOne({
      where: { id },
      relations: ['booking', 'user', 'paymentMethod'],
    });

    if (!transaction) {
      throw new NotFoundException(`Payment transaction with ID ${id} not found`);
    }

    return transaction;
  }

  /**
   * Get payment transaction by transaction ID
   */
  async findByTransactionId(transactionId: string): Promise<PaymentTransaction> {
    const transaction = await this.paymentTransactionRepository.findOne({
      where: { transactionId },
      relations: ['booking', 'user', 'paymentMethod'],
    });

    if (!transaction) {
      throw new NotFoundException(
        `Payment transaction with transaction ID ${transactionId} not found`,
      );
    }

    return transaction;
  }

  /**
   * Search payment transactions
   */
  async search(searchPaymentsDto: SearchPaymentsDto): Promise<{
    transactions: PaymentTransaction[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      bookingId,
      userId,
      status,
      type,
      paymentGateway,
      transactionId,
      dateFrom,
      dateTo,
      page = 1,
      limit = 10,
    } = searchPaymentsDto;

    const queryBuilder = this.paymentTransactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.booking', 'booking')
      .leftJoinAndSelect('transaction.user', 'user')
      .leftJoinAndSelect('transaction.paymentMethod', 'paymentMethod');

    if (bookingId) {
      queryBuilder.andWhere('transaction.bookingId = :bookingId', { bookingId });
    }

    if (userId) {
      queryBuilder.andWhere('transaction.userId = :userId', { userId });
    }

    if (status) {
      queryBuilder.andWhere('transaction.status = :status', { status });
    }

    if (type) {
      queryBuilder.andWhere('transaction.type = :type', { type });
    }

    if (paymentGateway) {
      queryBuilder.andWhere('transaction.paymentGateway = :paymentGateway', {
        paymentGateway,
      });
    }

    if (transactionId) {
      queryBuilder.andWhere('transaction.transactionId LIKE :transactionId', {
        transactionId: `%${transactionId}%`,
      });
    }

    if (dateFrom && dateTo) {
      queryBuilder.andWhere('transaction.createdAt BETWEEN :from AND :to', {
        from: new Date(dateFrom),
        to: new Date(dateTo),
      });
    } else if (dateFrom) {
      queryBuilder.andWhere('transaction.createdAt >= :from', {
        from: new Date(dateFrom),
      });
    } else if (dateTo) {
      queryBuilder.andWhere('transaction.createdAt <= :to', {
        to: new Date(dateTo),
      });
    }

    queryBuilder.orderBy('transaction.createdAt', 'DESC');

    const total = await queryBuilder.getCount();

    const transactions = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { transactions, total, page, limit };
  }

  /**
   * Get invoice by ID
   */
  async getInvoice(id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: ['booking', 'user', 'transactions'],
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    return invoice;
  }

  /**
   * Get invoice by invoice number
   */
  async getInvoiceByNumber(invoiceNumber: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { invoiceNumber },
      relations: ['booking', 'user', 'transactions'],
    });

    if (!invoice) {
      throw new NotFoundException(
        `Invoice with invoice number ${invoiceNumber} not found`,
      );
    }

    return invoice;
  }

  /**
   * Get receipt by ID
   */
  async getReceipt(id: string): Promise<Receipt> {
    const receipt = await this.receiptRepository.findOne({
      where: { id },
      relations: ['booking', 'user', 'paymentTransaction', 'invoice'],
    });

    if (!receipt) {
      throw new NotFoundException(`Receipt with ID ${id} not found`);
    }

    return receipt;
  }

  /**
   * Get receipt by receipt number
   */
  async getReceiptByNumber(receiptNumber: string): Promise<Receipt> {
    const receipt = await this.receiptRepository.findOne({
      where: { receiptNumber },
      relations: ['booking', 'user', 'paymentTransaction', 'invoice'],
    });

    if (!receipt) {
      throw new NotFoundException(
        `Receipt with receipt number ${receiptNumber} not found`,
      );
    }

    return receipt;
  }

  /**
   * Get invoices for a booking
   */
  async getInvoicesByBooking(bookingId: string): Promise<Invoice[]> {
    return await this.invoiceRepository.find({
      where: { bookingId },
      relations: ['transactions'],
      order: { invoiceDate: 'DESC' },
    });
  }

  /**
   * Get receipts for a booking
   */
  async getReceiptsByBooking(bookingId: string): Promise<Receipt[]> {
    return await this.receiptRepository.find({
      where: { bookingId },
      relations: ['paymentTransaction', 'invoice'],
      order: { receiptDate: 'DESC' },
    });
  }
}

