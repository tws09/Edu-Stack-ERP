import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:easy_localization/easy_localization.dart';

import '../../providers/auth_provider.dart';
import '../../providers/org_provider.dart';
import '../../core/storage/local_storage.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabs;
  final _emailCtrl    = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _formKey      = GlobalKey<FormState>();
  bool _obscure       = true;
  bool _loading       = false;
  String? _error;

  // Maps tab index → loginAs value
  final _loginAsValues = ['admin', 'teacher', 'student'];
  final _tabLabelKeys  = ['auth.admin', 'auth.teacher', 'auth.student'];

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 3, vsync: this, initialIndex: 2); // default Student
  }

  @override
  void dispose() {
    _tabs.dispose();
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() { _loading = true; _error = null; });

    final slug    = LocalStorageService.orgSlug ?? '';
    final loginAs = _loginAsValues[_tabs.index];

    try {
      await ref.read(authProvider.notifier).login(
        email:    _emailCtrl.text.trim(),
        password: _passwordCtrl.text,
        slug:     slug,
        loginAs:  loginAs,
      );
      if (!mounted) return;
      final user = ref.read(authProvider).user!;
      context.go(user.homeRoute);
    } catch (e) {
      setState(() {
        _error = e.toString().replaceAll('Exception: ', '');
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final cs  = Theme.of(context).colorScheme;
    final tt  = Theme.of(context).textTheme;
    final org = ref.watch(orgProvider);

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(24, 40, 24, 24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [

                // School logo + name
                Row(
                  children: [
                    _OrgLogo(logoUrl: org?.logoUrl, primaryColor: cs.primary),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(org?.name ?? 'EduStack', style: tt.titleLarge?.copyWith(fontWeight: FontWeight.w800)),
                          Text('auth.signInToContinue'.tr(), style: tt.bodySmall?.copyWith(color: cs.onSurfaceVariant)),
                        ],
                      ),
                    ),
                    // Switch school
                    IconButton(
                      tooltip: 'auth.switchSchool'.tr(),
                      icon: Icon(Icons.qr_code_scanner_rounded, color: cs.primary),
                      onPressed: () {
                        ref.read(orgProvider.notifier).clearOrg();
                        context.go('/onboarding/scan');
                      },
                    ),
                  ],
                ),

                const SizedBox(height: 36),

                // Role tabs
                Container(
                  decoration: BoxDecoration(
                    color: cs.surfaceContainerHighest,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: TabBar(
                    controller: _tabs,
                    indicator: BoxDecoration(
                      color: cs.primary,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    indicatorSize: TabBarIndicatorSize.tab,
                    labelColor: cs.onPrimary,
                    unselectedLabelColor: cs.onSurfaceVariant,
                    labelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
                    dividerColor: Colors.transparent,
                    tabs: _tabLabelKeys.map((k) => Tab(text: k.tr())).toList(),
                  ),
                ),

                const SizedBox(height: 32),

                // Email
                TextFormField(
                  controller: _emailCtrl,
                  keyboardType: TextInputType.emailAddress,
                  textInputAction: TextInputAction.next,
                  decoration: InputDecoration(
                    labelText: 'auth.email'.tr(),
                    prefixIcon: const Icon(Icons.email_outlined),
                  ),
                  validator: (v) {
                    if (v == null || v.isEmpty) return 'auth.email'.tr();
                    if (!v.contains('@')) return 'auth.email'.tr();
                    return null;
                  },
                ),

                const SizedBox(height: 16),

                // Password
                TextFormField(
                  controller: _passwordCtrl,
                  obscureText: _obscure,
                  textInputAction: TextInputAction.done,
                  onFieldSubmitted: (_) => _submit(),
                  decoration: InputDecoration(
                    labelText: 'auth.password'.tr(),
                    prefixIcon: const Icon(Icons.lock_outline_rounded),
                    suffixIcon: IconButton(
                      icon: Icon(_obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined),
                      onPressed: () => setState(() => _obscure = !_obscure),
                    ),
                  ),
                  validator: (v) {
                    if (v == null || v.isEmpty) return 'Password is required';
                    if (v.length < 6) return 'Password too short';
                    return null;
                  },
                ),

                // Error
                if (_error != null) ...[
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: cs.errorContainer,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.error_outline_rounded, color: cs.onErrorContainer, size: 18),
                        const SizedBox(width: 8),
                        Expanded(child: Text(_error!, style: TextStyle(color: cs.onErrorContainer, fontSize: 13))),
                      ],
                    ),
                  ),
                ],

                const SizedBox(height: 28),

                // Submit
                FilledButton(
                  onPressed: _loading ? null : _submit,
                  child: _loading
                      ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white))
                      : Text('auth.signIn'.tr()),
                ),

                const SizedBox(height: 32),

                // Footer
                Center(
                  child: Text(
                    'EduStack PK · WolfStack',
                    style: tt.bodySmall?.copyWith(color: cs.onSurfaceVariant),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _OrgLogo extends StatelessWidget {
  final String? logoUrl;
  final Color primaryColor;
  const _OrgLogo({this.logoUrl, required this.primaryColor});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 56,
      height: 56,
      decoration: BoxDecoration(
        color: primaryColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: primaryColor.withOpacity(0.2)),
      ),
      child: logoUrl != null
          ? ClipRRect(
              borderRadius: BorderRadius.circular(14),
              child: CachedNetworkImage(imageUrl: logoUrl!, fit: BoxFit.contain),
            )
          : Icon(Icons.school_rounded, color: primaryColor, size: 30),
    );
  }
}
