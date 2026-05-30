import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class CoordinatorShell extends StatelessWidget {
  final Widget child;
  const CoordinatorShell({super.key, required this.child});

  static const _tabs = [
    (icon: Icons.dashboard_rounded,    label: 'Dashboard',  path: '/coordinator'),
    (icon: Icons.how_to_reg_rounded,   label: 'Attendance', path: '/coordinator/attendance'),
    (icon: Icons.event_note_rounded,   label: 'Timetable',  path: '/coordinator/timetable'),
    (icon: Icons.notifications_outlined, label: 'Alerts',  path: '/coordinator/notifications'),
  ];

  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    final idx = _tabs.indexWhere((t) => location == t.path || location.startsWith('${t.path}/'));
    final current = idx < 0 ? 0 : idx;

    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: current,
        onDestinationSelected: (i) => context.go(_tabs[i].path),
        destinations: _tabs.map((t) => NavigationDestination(icon: Icon(t.icon), label: t.label)).toList(),
      ),
    );
  }
}
