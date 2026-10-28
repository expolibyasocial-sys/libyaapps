<?php

namespace App\Filament\Resources;

use App\Filament\Resources\SubmissionResource\Pages;
use App\Models\Application;
use App\Models\AuditLog;
use App\Models\Company;
use App\Models\Submission;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class SubmissionResource extends Resource
{
    protected static ?string $model = Submission::class;
    protected static ?string $navigationIcon = 'heroicon-o-inbox-stack';
    protected static ?string $navigationLabel = 'طلبات الإضافة والتسجيل';
    protected static ?string $modelLabel = 'طلب وارد';
    protected static ?string $pluralModelLabel = 'طلبات الإضافة والتسجيل';
    protected static ?string $navigationGroup = 'المراجعة والاعتماد';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('بيانات الطلب المرجعية')
                ->columns(2)
                ->schema([
                    Forms\Components\TextInput::make('reference_number')
                        ->label('الرقم المرجعي')
                        ->disabled(),
                    Forms\Components\Select::make('submission_type')
                        ->label('نوع الطلب')
                        ->options([
                            'app' => 'إضافة تطبيق',
                            'news' => 'خبر تقني',
                            'exhibitor' => 'تسجيل عارض',
                            'sponsor' => 'طلب رعاية',
                            'visitor' => 'تسجيل زائر',
                            'contact' => 'رسالة تواصل',
                        ])
                        ->disabled(),
                    Forms\Components\TextInput::make('title_or_name')
                        ->label('اسم التطبيق / العنوان')
                        ->required(),
                    Forms\Components\TextInput::make('company_name')
                        ->label('الشركة المطورة / المؤسسة')
                        ->required(),
                    Forms\Components\TextInput::make('contact_name')
                        ->label('اسم مسؤول التواصل')
                        ->required(),
                    Forms\Components\TextInput::make('contact_email')
                        ->label('البريد الإلكتروني')
                        ->email()
                        ->required(),
                    Forms\Components\Select::make('status')
                        ->label('حالة المراجعة')
                        ->options([
                            'new' => 'جديد (New)',
                            'under_review' => 'قيد المراجعة (Under Review)',
                            'approved' => 'معتمد ومنشور (Approved)',
                            'rejected' => 'مرفوض (Rejected)',
                            'archived' => 'مؤرشف (Archived)',
                        ])
                        ->required(),
                    Forms\Components\Textarea::make('admin_notes')
                        ->label('ملاحظات الإدارة الداخلية')
                        ->columnSpanFull(),
                ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('reference_number')
                    ->label('الرقم المرجعي')
                    ->searchable()
                    ->copyable(),
                Tables\Columns\TextColumn::make('submission_type')
                    ->label('النوع'),
                Tables\Columns\TextColumn::make('title_or_name')
                    ->label('العنوان / التطبيق')
                    ->searchable(),
                Tables\Columns\TextColumn::make('company_name')
                    ->label('الشركة المطورة')
                    ->searchable(),
                Tables\Columns\TextColumn::make('status')
                    ->label('الحالة'),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('تاريخ الإرسال')
                    ->dateTime('Y-m-d H:i'),
            ])
            ->actions([
                Tables\Actions\Action::make('approve_and_publish')
                    ->label('اعتماد ونشر في المنصة')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->requiresConfirmation()
                    ->visible(fn (Submission $record): bool => $record->status !== 'approved')
                    ->action(function (Submission $record): void {
                        $record->update([
                            'status' => 'approved',
                            'reviewed_by' => auth()->id(),
                            'reviewed_at' => now(),
                        ]);

                        if ($record->submission_type === 'app') {
                            $company = Company::firstOrCreate(
                                ['name_ar' => trim($record->company_name)],
                                [
                                    'slug' => Str::slug($record->company_name) . '-' . uniqid(),
                                    'description_ar' => 'شركة مطورة مسجلة عبر منصة التطبيقات الليبية.',
                                    'city_id' => 1,
                                    'specialization_ar' => 'تطوير التطبيقات والأنظمة الرقمية',
                                    'email' => $record->contact_email,
                                    'phone' => $record->contact_phone,
                                    'is_verified' => true,
                                    'status' => 'published',
                                ]
                            );

                            Application::create([
                                'name_ar' => $record->title_or_name,
                                'name_en' => $record->payload['app_name_en'] ?? $record->title_or_name,
                                'slug' => Str::slug($record->title_or_name) . '-' . uniqid(),
                                'category_id' => $record->payload['category_id'] ?? 1,
                                'company_id' => $company->id,
                                'city_id' => 1,
                                'launch_year' => $record->payload['launch_year'] ?? now()->year,
                                'status' => 'active',
                                'app_type' => $record->payload['app_type'] ?? 'B2C',
                                'short_description_ar' => $record->payload['short_description_ar'] ?? '',
                                'full_description_ar' => $record->payload['full_description_ar'] ?? '',
                                'main_features_ar' => $record->payload['main_features_ar'] ?? [],
                                'platforms' => $record->payload['platforms'] ?? ['Android', 'iOS'],
                                'is_verified' => true,
                                'published' => true,
                            ]);
                        }

                        Cache::tags(['homepage', 'apps', 'companies', 'news'])->flush();

                        AuditLog::create([
                            'user_id' => auth()->id(),
                            'actor_name' => auth()->user()?->name ?? 'Admin',
                            'actor_role_ar' => 'مدير النظام',
                            'action_type' => 'SUBMISSION_APPROVED',
                            'entity_type' => 'Submission',
                            'entity_label' => $record->reference_number,
                            'details_ar' => 'تم اعتماد الطلب ونشره في الدليل العام وإعادة تحديث التخزين المؤقت.',
                            'ip_address' => request()->ip(),
                        ]);

                        Notification::make()
                            ->title('تم اعتماد الطلب ونشره في الموقع العام بنجاح')
                            ->success()
                            ->send();
                    }),
                Tables\Actions\EditAction::make(),
            ]);
    }
}
