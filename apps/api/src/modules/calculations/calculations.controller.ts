import { Body, Controller, Get, Param, Post, UsePipes } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import {
  calculateAttorneyFeeSchema,
  calculateCourtFeeSchema,
  calculateEnforcementDebtSchema,
  calculateExecutionPreviewSchema,
  calculateIncomeTaxSchema,
  calculateLegalInterestSchema,
  calculateRentIncreaseSchema,
  calculateSelfEmploymentReceiptSchema,
  calculateSgkEmployerCostSchema,
  calculateVatSchema,
  type CalculateAttorneyFeeRequest,
  type CalculateCourtFeeRequest,
  type CalculateEnforcementDebtRequest,
  type CalculateExecutionPreviewRequest,
  type CalculateIncomeTaxRequest,
  type CalculateLegalInterestRequest,
  type CalculateRentIncreaseRequest,
  type CalculateSelfEmploymentReceiptRequest,
  type CalculateSgkEmployerCostRequest,
  type CalculateVatRequest,
} from "@hukukai/validation";
import type { AuthenticatedUser } from "@hukukai/types";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- Nest DI için değer importu gerekir
import { CalculationsService } from "./calculations.service";

@ApiTags("calculations")
@Controller("calculations")
export class CalculationsController {
  constructor(private readonly calculationsService: CalculationsService) {}

  @Post("interest")
  @UsePipes(new ZodValidationPipe(calculateLegalInterestSchema))
  interest(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CalculateLegalInterestRequest,
  ) {
    return this.calculationsService.legalInterest(user.id, body);
  }

  @Post("enforcement-debt")
  @UsePipes(new ZodValidationPipe(calculateEnforcementDebtSchema))
  enforcementDebt(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CalculateEnforcementDebtRequest,
  ) {
    return this.calculationsService.enforcementDebt(user.id, body);
  }

  @Post("rent-increase")
  @UsePipes(new ZodValidationPipe(calculateRentIncreaseSchema))
  rentIncrease(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CalculateRentIncreaseRequest,
  ) {
    return this.calculationsService.rentIncrease(user.id, body);
  }

  @Post("attorney-fee")
  @UsePipes(new ZodValidationPipe(calculateAttorneyFeeSchema))
  attorneyFee(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CalculateAttorneyFeeRequest,
  ) {
    return this.calculationsService.attorneyFee(user.id, body);
  }

  @Post("court-fee")
  @UsePipes(new ZodValidationPipe(calculateCourtFeeSchema))
  courtFee(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CalculateCourtFeeRequest,
  ) {
    return this.calculationsService.courtFee(user.id, body);
  }

  @Post("self-employment-receipt")
  @UsePipes(new ZodValidationPipe(calculateSelfEmploymentReceiptSchema))
  selfEmploymentReceipt(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CalculateSelfEmploymentReceiptRequest,
  ) {
    return this.calculationsService.selfEmploymentReceipt(user.id, body);
  }

  @Post("income-tax")
  @UsePipes(new ZodValidationPipe(calculateIncomeTaxSchema))
  incomeTax(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CalculateIncomeTaxRequest,
  ) {
    return this.calculationsService.incomeTax(user.id, body);
  }

  @Post("vat")
  @UsePipes(new ZodValidationPipe(calculateVatSchema))
  vat(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CalculateVatRequest,
  ) {
    return this.calculationsService.vat(user.id, body);
  }

  @Post("sgk")
  @UsePipes(new ZodValidationPipe(calculateSgkEmployerCostSchema))
  sgk(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CalculateSgkEmployerCostRequest,
  ) {
    return this.calculationsService.sgkEmployerCost(user.id, body);
  }

  @Post("execution-preview")
  @UsePipes(new ZodValidationPipe(calculateExecutionPreviewSchema))
  executionPreview(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CalculateExecutionPreviewRequest,
  ) {
    return this.calculationsService.executionPreview(user.id, body);
  }

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.calculationsService.findAll(user.id);
  }

  @Get(":id")
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    return this.calculationsService.findOne(user.id, id);
  }
}
