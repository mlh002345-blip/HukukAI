import { Body, Controller, Get, Param, Post, UsePipes } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import {
  generateCalculationReportSchema,
  generateDeadlineReportSchema,
  generateDocumentAnalysisReportSchema,
  type GenerateCalculationReportInput,
  type GenerateDeadlineReportInput,
  type GenerateDocumentAnalysisReportInput,
} from "@hukukai/validation";
import type { AuthenticatedUser } from "@hukukai/types";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- Nest DI için değer importu gerekir
import { ReportsService } from "./reports.service";

@ApiTags("reports")
@Controller("reports")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post("document-analysis")
  @UsePipes(new ZodValidationPipe(generateDocumentAnalysisReportSchema))
  documentAnalysis(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: GenerateDocumentAnalysisReportInput,
  ) {
    return this.reportsService.generateDocumentAnalysisReport(
      user.id,
      body.documentId,
    );
  }

  @Post("calculation")
  @UsePipes(new ZodValidationPipe(generateCalculationReportSchema))
  calculation(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: GenerateCalculationReportInput,
  ) {
    return this.reportsService.generateCalculationReport(
      user.id,
      body.calculationId,
    );
  }

  @Post("deadline")
  @UsePipes(new ZodValidationPipe(generateDeadlineReportSchema))
  deadline(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: GenerateDeadlineReportInput,
  ) {
    return this.reportsService.generateDeadlineReport(user.id, body.deadlineId);
  }

  @Post("traffic-fine")
  @UsePipes(new ZodValidationPipe(generateDeadlineReportSchema))
  trafficFine(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: GenerateDeadlineReportInput,
  ) {
    // Trafik cezası süresi de bir Deadline kaydıdır (ruleId'ye göre
    // rapor başlığı otomatik seçilir); ayrı bir veri modeli yoktur.
    return this.reportsService.generateDeadlineReport(user.id, body.deadlineId);
  }

  @Post("self-employment-receipt")
  @UsePipes(new ZodValidationPipe(generateCalculationReportSchema))
  selfEmploymentReceipt(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: GenerateCalculationReportInput,
  ) {
    // Serbest meslek makbuzu da bir Calculation kaydıdır
    // (calculationType'a göre rapor başlığı otomatik seçilir).
    return this.reportsService.generateCalculationReport(
      user.id,
      body.calculationId,
    );
  }

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.reportsService.findAll(user.id);
  }

  @Get(":id/download-url")
  getDownloadUrl(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    return this.reportsService.getDownloadUrl(user.id, id);
  }
}
