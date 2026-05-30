import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../providers/auth_provider.dart';
import '../../providers/org_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final org  = ref.watch(orgProvider);
    final cs   = Theme.of(context).colorScheme;
    final tt   = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // ── Avatar + name ────────────────────────────────────
          Center(
            child: Column(
              children: [
                CircleAvatar(
                  radius: 48,
                  backgroundColor: cs.primaryContainer,
                  child: user?.profilePhotoUrl != null
                      ? ClipOval(
                          child: CachedNetworkImage(
                            imageUrl: user!.profilePhotoUrl!,
                            width: 96,
                            height: 96,
                            fit: BoxFit.cover,
                          ),
                        )
                      : Text(
                          user?.name.isNotEmpty == true ? user!.name[0].toUpperCase() : '?',
                          style: TextStyle(fontSize: 36, color: cs.onPrimaryContainer, fontWeight: FontWeight.bold),
                        ),
                ),
                const SizedBox(height: 14),
                Text(user?.name ?? '', style: tt.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text(user?.email ?? '', style: tt.bodyMedium?.copyWith(color: cs.onSurfaceVariant)),
                const SizedBox(height: 4),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  decoration: BoxDecoration(
                    color: cs.primaryContainer,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    _roleLabel(user?.role ?? ''),
                    style: tt.labelMedium?.copyWith(color: cs.onPrimaryContainer, fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),
          const Divider(),
          const SizedBox(height: 12),

          // ── School info ──────────────────────────────────────
          if (org != null) ...[
            Text('School', style: tt.labelLarge?.copyWith(color: cs.onSurfaceVariant)),
            const SizedBox(height: 8),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    if (org.logoUrl != null)
                      ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: CachedNetworkImage(imageUrl: org.logoUrl!, width: 40, height: 40, fit: BoxFit.contain),
                      )
                    else
                      Icon(Icons.school_rounded, size: 40, color: cs.primary),
                    const SizedBox(width: 12),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(org.name, style: tt.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
                        Text(org.slug, style: tt.bodySmall?.copyWith(color: cs.onSurfaceVariant)),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),
          ],

          // ── Actions ──────────────────────────────────────────
          Text('Account', style: tt.labelLarge?.copyWith(color: cs.onSurfaceVariant)),
          const SizedBox(height: 8),
          Card(
            child: Column(
              children: [
                ListTile(
                  leading: Icon(Icons.lock_outline_rounded, color: cs.primary),
                  title: const Text('Change Password'),
                  trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 16),
                  onTap: () {},
                ),
                const Divider(height: 1, indent: 56),
                ListTile(
                  leading: Icon(Icons.logout_rounded, color: cs.error),
                  title: Text('Sign Out', style: TextStyle(color: cs.error)),
                  onTap: () => _confirmSignOut(context, ref),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _roleLabel(String role) => switch (role) {
    'student'          => 'Student',
    'teacher'          => 'Teacher',
    'branch_principal' => 'Principal',
    'coordinator'      => 'Coordinator',
    'accountant'       => 'Accountant',
    'it_admin'         => 'IT Admin',
    'group_admin'      => 'Group Admin',
    'super_admin'      => 'Super Admin',
    _                  => role,
  };

  void _confirmSignOut(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Sign Out'),
        content: const Text('Are you sure you want to sign out?'),
        actions: [
          TextButton(onPressed: () => Navigator.of(ctx).pop(), child: const Text('Cancel')),
          FilledButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              ref.read(authProvider.notifier).logout();
            },
            child: const Text('Sign Out'),
          ),
        ],
      ),
    );
  }
}
