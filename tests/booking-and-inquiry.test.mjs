import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const loadDependency = createRequire(import.meta.url);
import vm from 'node:vm';
import ts from 'typescript';

function loadSource(file, mocks = {}, globals = {}) {
  const source = fs.readFileSync(path.join(import.meta.dirname, '..', file), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const exports = {};
  vm.runInNewContext(outputText, {
    exports,
    require: (name) => Object.hasOwn(mocks, name) ? mocks[name] : loadDependency(name),
    console: { error() {}, log() {} },
    process: { env: {} },
    ...globals,
  });
  return exports;
}

const {
  bookingSubmissionSchema,
  inquirySubmissionSchema,
  campaignRequestSchema,
} = loadSource('src/lib/validations.ts');

test('bookingSubmissionSchema validates correct inputs and rejects malformed fields', () => {
  const validBooking = {
    firstName: 'Rashid',
    lastName: 'Al-Maktoum',
    email: 'rashid@example.ae',
    phone: '+971501234567',
    company: 'Emirates Media',
    studioId: 'studio-a',
    sessionType: 'video_production',
    scheduledAt: '2026-10-15T10:00:00',
    durationHours: 4,
    headcount: 8,
    needsCrew: true,
    needsEditing: true,
  };

  const parseResult = bookingSubmissionSchema.safeParse(validBooking);
  assert.equal(parseResult.success, true);
  if (parseResult.success) {
    assert.equal(parseResult.data.durationHours, 4);
    assert.equal(parseResult.data.needsCrew, true);
    assert.equal(parseResult.data.needsColorGrading, false); // Default
    assert.equal(parseResult.data.selectedGearPackage, 'none'); // Default
  }

  assert.equal(bookingSubmissionSchema.safeParse({
    ...validBooking, sessionType: 'virtual_production',
  }).success, true);

  // Reject missing required name
  const missingName = { ...validBooking, firstName: '' };
  assert.equal(bookingSubmissionSchema.safeParse(missingName).success, false);

  // Reject invalid email
  const badEmail = { ...validBooking, email: 'not-an-email' };
  assert.equal(bookingSubmissionSchema.safeParse(badEmail).success, false);

  // Reject duration out of bounds (> 24 hours)
  const excessiveDuration = { ...validBooking, durationHours: 25 };
  assert.equal(bookingSubmissionSchema.safeParse(excessiveDuration).success, false);

  // Reject duration < 1 hour
  const zeroDuration = { ...validBooking, durationHours: 0 };
  assert.equal(bookingSubmissionSchema.safeParse(zeroDuration).success, false);

  // Reject operating hours violation (before 09:00 or after 21:00)
  const tooEarly = { ...validBooking, scheduledAt: '2026-10-15T06:30:00' };
  assert.equal(bookingSubmissionSchema.safeParse(tooEarly).success, false);

  const tooLate = { ...validBooking, scheduledAt: '2026-10-15T22:30:00' };
  assert.equal(bookingSubmissionSchema.safeParse(tooLate).success, false);

  const missingTime = { ...validBooking, scheduledAt: '2026-10-15' };
  assert.equal(bookingSubmissionSchema.safeParse(missingTime).success, false);

  // Accept valid boundary times (09:00 and 21:00) with turnkey packages and add-ons
  const boundaryBooking = {
    ...validBooking,
    scheduledAt: '2026-10-15T09:00',
    turnkeyPackageId: 'podcast-package',
    hasTeleprompter: true,
    extraMicsCount: 2,
    hasRushDelivery: true,
    promoCode: 'YAS10',
  };
  const boundaryResult = bookingSubmissionSchema.safeParse(boundaryBooking);
  assert.equal(boundaryResult.success, true);
  if (boundaryResult.success) {
    assert.equal(boundaryResult.data.turnkeyPackageId, 'podcast-package');
    assert.equal(boundaryResult.data.hasTeleprompter, true);
    assert.equal(boundaryResult.data.extraMicsCount, 2);
    assert.equal(boundaryResult.data.hasRushDelivery, true);
    assert.equal(boundaryResult.data.promoCode, 'YAS10');
  }
});

test('inquirySubmissionSchema enforces minimum message length and valid categories', () => {
  const validInquiry = {
    name: 'Sarah Connor',
    email: 'sarah@cyberdyne.com',
    phone: '+14155552671',
    company: 'SkyNet Media',
    inquiryType: 'ob_van',
    message: 'We require 2 OB vans for an outdoor live sports broadcast in Riyadh.',
  };

  assert.equal(inquirySubmissionSchema.safeParse(validInquiry).success, true);

  // Reject message too short (< 10 chars)
  const shortMessage = { ...validInquiry, message: 'Too short' };
  assert.equal(inquirySubmissionSchema.safeParse(shortMessage).success, false);

  // Reject invalid inquiry type
  const badType = { ...validInquiry, inquiryType: 'invalid_category' };
  assert.equal(inquirySubmissionSchema.safeParse(badType).success, false);
});

test('campaignRequestSchema validates influencer brief fields', () => {
  const validCampaign = {
    creatorId: 'aboflah',
    creatorName: 'AboFlah',
    brandName: 'National Telecom',
    contactName: 'Director of Marketing',
    email: 'marketing@telecom.sa',
    phone: '+966500000000',
    campaignObjective: 'Brand Awareness Campaign',
    budgetTier: 'tier_large',
  };

  assert.equal(campaignRequestSchema.safeParse(validCampaign).success, true);

  // Missing brand name
  assert.equal(campaignRequestSchema.safeParse({ ...validCampaign, brandName: '' }).success, false);

  // Invalid email
  assert.equal(campaignRequestSchema.safeParse({ ...validCampaign, email: 'bad' }).success, false);
});

test('validateLegitimateEmail accepts real personal/business domains and rejects disposable/hallucinated domains', () => {
  const { validateLegitimateEmail, registerUserSchema } = loadSource('src/lib/validations.ts');

  // Real emails must pass
  assert.equal(validateLegitimateEmail('rashid.almaktoum@gmail.com').isValid, true);
  assert.equal(validateLegitimateEmail('tariq@dubaimedia.ae').isValid, true);
  assert.equal(validateLegitimateEmail('sarah.connor@outlook.com').isValid, true);
  assert.equal(validateLegitimateEmail('director@production-house.com').isValid, true);
  assert.equal(validateLegitimateEmail('producer@yahoo.com').isValid, true);

  // Disposable and hallucinated domains must fail
  assert.equal(validateLegitimateEmail('user@tempmail.com').isValid, false);
  assert.equal(validateLegitimateEmail('fake@mailinator.com').isValid, false);
  assert.equal(validateLegitimateEmail('user@10minutemail.com').isValid, false);
  assert.equal(validateLegitimateEmail('asdf@asdf.com').isValid, false);
  assert.equal(validateLegitimateEmail('test@fake.com').isValid, false);
  assert.equal(validateLegitimateEmail('test@test.com').isValid, false);

  // Obvious placeholder local-parts must fail
  assert.equal(validateLegitimateEmail('test@gmail.com').isValid, false);
  assert.equal(validateLegitimateEmail('fake@company.com').isValid, false);
  assert.equal(validateLegitimateEmail('asdf@gmail.com').isValid, false);

  // registerUserSchema validation
  const validRegister = {
    name: 'Tariq Mansoor',
    email: 'tariq.director@gmail.com',
    password: 'securePassword123!',
    phone: '+971501234567',
    company: 'Dubai Creative Agency',
  };
  assert.equal(registerUserSchema.safeParse(validRegister).success, true);

  // Reject registration with disposable email
  const fakeRegister = {
    ...validRegister,
    email: 'user@mailinator.com',
  };
  assert.equal(registerUserSchema.safeParse(fakeRegister).success, false);
});
