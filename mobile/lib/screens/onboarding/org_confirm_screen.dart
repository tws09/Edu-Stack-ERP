import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:easy_localization/easy_localization.dart';

import '../../models/org.dart';
import '../../providers/org_provider.dart';

class OrgConfirmScreen extends ConsumerWidget {
  final OrgConfig org;
  const OrgConfirmScreen({super.key, required this.org});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(28),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // School logo
              Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  color: cs.surfaceContainerHighest,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: cs.outlineVariant),
                ),
                child: org.logoUrl != null
                    ? ClipRRect(
                        borderRadius: BorderRadius.circular(22),
                        child: CachedNetworkImage(
                          imageUrl: org.logoUrl!,
                          fit: BoxFit.contain,
                          placeholder: (_, __) => const Center(child: CircularProgressIndicator()),
                          errorWidget: (_, __, ___) => Icon(Icons.school_rounded, size: 48, color: cs.primary),
                        ),
                      )
                    : Icon(Icons.school_rounded, size: 52, color: cs.primary),
              ),

              const SizedBox(height: 28),

              Text('onboarding.isThisYourSchool'.tr(), style: tt.titleMedium?.copyWith(color: cs.onSurfaceVariant)),
              const SizedBox(height: 8),
              Text(
                org.name,
                style: tt.headlineMedium?.copyWith(fontWeight: FontWeight.w800),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: cs.primaryContainer,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  org.slug,
                  style: TextStyle(color: cs.onPrimaryContainer, fontWeight: FontWeight.w600, fontSize: 13),
                ),
              ),

              const SizedBox(height: 48),

              // Confirm
              FilledButton.icon(
                onPressed: () {
                  ref.read(orgProvider.notifier).setOrg(org);
                  context.go('/login');
                },
                icon: const Icon(Icons.check_circle_outline_rounded),
                label: Text('onboarding.confirmSchool'.tr()),
              ),

              const SizedBox(height: 12),

              // Wrong school
              OutlinedButton.icon(
                onPressed: () => context.go('/onboarding/scan'),
                icon: const Icon(Icons.qr_code_scanner_rounded),
                label: Text('onboarding.scanDifferent'.tr()),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
